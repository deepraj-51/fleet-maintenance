package com.deepraj.fleet_maintenance.scheduler;

import com.deepraj.fleet_maintenance.entity.ServiceRecord;
import com.deepraj.fleet_maintenance.entity.ServiceRecordEvent;
import com.deepraj.fleet_maintenance.entity.User;
import com.deepraj.fleet_maintenance.entity.Vehicle;
import com.deepraj.fleet_maintenance.enums.EventType;
import com.deepraj.fleet_maintenance.enums.ServiceStatus;
import com.deepraj.fleet_maintenance.repository.ServiceRecordEventRepository;
import com.deepraj.fleet_maintenance.repository.ServiceRecordRepository;
import com.deepraj.fleet_maintenance.repository.UserRepository;
import com.deepraj.fleet_maintenance.repository.VehicleRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class DueServiceDetector {

    private final VehicleRepository vehicleRepo;
    private final ServiceRecordRepository recordRepo;
    private final ServiceRecordEventRepository eventRepo;
    private final UserRepository userRepo;

    private static final String SYSTEM_USER_EMAIL = "system@fleet-maintenance.internal";

    public DueServiceDetector(VehicleRepository vehicleRepo, ServiceRecordRepository recordRepo,
                              ServiceRecordEventRepository eventRepo, UserRepository userRepo) {
        this.vehicleRepo = vehicleRepo;
        this.recordRepo = recordRepo;
        this.eventRepo = eventRepo;
        this.userRepo = userRepo;
    }

    @Scheduled(cron = "0 0 * * * *") // hourly
    @Transactional
    public void detectDueVehicles() {
        List<Vehicle> vehicles = vehicleRepo.findByArchivedFalse();
        User systemUser = userRepo.findByEmail(SYSTEM_USER_EMAIL)
                .orElseThrow(() -> new IllegalStateException(
                        "System user not seeded — run the data seeder before starting the scheduler"));

        for (Vehicle v : vehicles) {
            boolean hasOpenRecord = recordRepo.existsByVehicleIdAndStatusIn(
                    v.getId(), List.of(ServiceStatus.DUE, ServiceStatus.BOOKED, ServiceStatus.IN_SERVICE));

            if (isDue(v) && !hasOpenRecord) {
                createDueRecord(v, systemUser);
            }
        }
    }

    private boolean isDue(Vehicle v) {
        boolean neverServiced = v.getLastServiceDate() == null;

        boolean dateDue = v.getLastServiceDate() != null &&
                ChronoUnit.DAYS.between(v.getLastServiceDate(), LocalDate.now()) >= v.getDateIntervalDays();

        boolean mileageDue = v.getLastServiceOdometer() != null &&
                (v.getCurrentOdometer() - v.getLastServiceOdometer()) >= v.getMileageInterval();

        return neverServiced || dateDue || mileageDue;
    }

    private void createDueRecord(Vehicle v, User systemUser) {
        ServiceRecord record = new ServiceRecord();
        record.setVehicle(v);
        record.setDescription("Scheduled maintenance due");
        record.setStatus(ServiceStatus.DUE);
        recordRepo.save(record);

        ServiceRecordEvent event = new ServiceRecordEvent();
        event.setServiceRecord(record);
        event.setEventType(EventType.CREATED);
        event.setNewValue("DUE");
        event.setNote("Auto-created by due detector");
        event.setPerformedBy(systemUser);
        eventRepo.save(event);
    }
}
