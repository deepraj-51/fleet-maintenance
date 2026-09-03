package com.deepraj.fleet_maintenance.controller;

import com.deepraj.fleet_maintenance.dto.CsvDtos.BulkUploadReport;
import com.deepraj.fleet_maintenance.entity.ServiceRecord;
import com.deepraj.fleet_maintenance.repository.ServiceRecordRepository;
import com.deepraj.fleet_maintenance.service.CsvService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/csv")
public class CsvController {

    private final CsvService csvService;
    private final ServiceRecordRepository recordRepo;

    public CsvController(CsvService csvService, ServiceRecordRepository recordRepo) {
        this.csvService = csvService;
        this.recordRepo = recordRepo;
    }

    @PostMapping(value = "/odometer-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BulkUploadReport> uploadOdometer(@RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.ok(csvService.bulkUpdateOdometer(file));
    }

    @GetMapping("/vehicles/{vehicleId}/service-history")
    public ResponseEntity<ByteArrayResource> exportHistory(@PathVariable Long vehicleId) throws Exception {
        List<ServiceRecord> records = recordRepo.findByVehicleId(vehicleId);

        List<Object[]> rows = records.stream()
                .map(r -> new Object[]{
                        r.getId(), r.getDescription(), r.getStatus(),
                        r.getScheduledDate(), r.getCompletedDate(), r.getCompletedOdometer()
                })
                .toList();

        byte[] csvBytes = csvService.exportServiceHistory(vehicleId, rows);
        ByteArrayResource resource = new ByteArrayResource(csvBytes);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"data.csv\"") // Added leading dot
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(csvBytes.length)
                .body(resource);

    }
}
