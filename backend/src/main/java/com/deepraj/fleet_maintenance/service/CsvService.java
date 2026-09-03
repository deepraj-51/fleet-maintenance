package com.deepraj.fleet_maintenance.service;

import com.deepraj.fleet_maintenance.dto.CsvDtos.*;
import com.deepraj.fleet_maintenance.entity.Vehicle;
import com.deepraj.fleet_maintenance.repository.VehicleRepository;
import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;
import com.opencsv.exceptions.CsvException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class CsvService {

    private final VehicleRepository vehicleRepo;

    public CsvService(VehicleRepository vehicleRepo) {
        this.vehicleRepo = vehicleRepo;
    }

    // Expected CSV columns: registrationNumber,odometer
    public BulkUploadReport bulkUpdateOdometer(MultipartFile file) throws IOException, CsvException {
        List<RowResult> results = new ArrayList<>();

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<String[]> rows = reader.readAll();

            // skip header row
            for (int i = 1; i < rows.size(); i++) {
                String[] row = rows.get(i);
                int rowNumber = i + 1; // 1-indexed, accounts for header

                if (row.length < 2) {
                    results.add(new RowResult(rowNumber, row.length > 0 ? row[0] : "",
                            false, "Row must have registrationNumber and odometer columns"));
                    continue;
                }

                String regNumber = row[0].trim();
                String odometerStr = row[1].trim();

                try {
                    int odometer = Integer.parseInt(odometerStr);

                    Vehicle vehicle = vehicleRepo.findByRegistrationNumber(regNumber)
                            .orElseThrow(() -> new IllegalArgumentException("No vehicle found with this registration number"));

                    if (odometer < vehicle.getCurrentOdometer()) {
                        results.add(new RowResult(rowNumber, regNumber, false,
                                "New odometer (" + odometer + ") is less than current (" + vehicle.getCurrentOdometer() + ")"));
                        continue;
                    }

                    vehicle.setCurrentOdometer(odometer);
                    vehicleRepo.save(vehicle);
                    results.add(new RowResult(rowNumber, regNumber, true, "Updated successfully"));

                } catch (NumberFormatException e) {
                    results.add(new RowResult(rowNumber, regNumber, false, "Odometer must be a number"));
                } catch (IllegalArgumentException e) {
                    results.add(new RowResult(rowNumber, regNumber, false, e.getMessage()));
                }
            }
        }

        long successCount = results.stream().filter(RowResult::success).count();
        return new BulkUploadReport(results.size(), (int) successCount,
                results.size() - (int) successCount, results);
    }

    public byte[] exportServiceHistory(Long vehicleId, List<Object[]> historyRows) throws IOException {
        // historyRows expected as: [serviceRecordId, description, status, scheduledDate, completedDate, completedOdometer]
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(out))) {
            writer.writeNext(new String[]{
                    "recordId", "description", "status", "scheduledDate", "completedDate", "completedOdometer"
            });

            for (Object[] row : historyRows) {
                writer.writeNext(new String[]{
                        String.valueOf(row[0]), String.valueOf(row[1]), String.valueOf(row[2]),
                        String.valueOf(row[3]), String.valueOf(row[4]), String.valueOf(row[5])
                });
            }
        }

        return out.toByteArray();
    }
}
