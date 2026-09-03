package com.deepraj.fleet_maintenance.service;

import com.deepraj.fleet_maintenance.entity.*;
import com.deepraj.fleet_maintenance.enums.EventType;
import com.deepraj.fleet_maintenance.enums.ServiceStatus;
import com.deepraj.fleet_maintenance.repository.ServiceRecordEventRepository;
import com.deepraj.fleet_maintenance.repository.ServiceRecordRepository;
import com.deepraj.fleet_maintenance.repository.VehicleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;

import static com.deepraj.fleet_maintenance.specification.ServiceRecordSpecifications.*;

@Service
public class ServiceRecordService {

    private final ServiceRecordRepository recordRepo;
    private final ServiceRecordEventRepository eventRepo;
    private final VehicleRepository vehicleRepo;

    private static final Map<ServiceStatus, ServiceStatus> LEGAL_TRANSITIONS = Map.of(
            ServiceStatus.DUE, ServiceStatus.BOOKED,
            ServiceStatus.BOOKED, ServiceStatus.IN_SERVICE,
            ServiceStatus.IN_SERVICE, ServiceStatus.COMPLETED
    );

    public ServiceRecordService(ServiceRecordRepository recordRepo,
                                ServiceRecordEventRepository eventRepo,
                                VehicleRepository vehicleRepo) {
        this.recordRepo = recordRepo;
        this.eventRepo = eventRepo;
        this.vehicleRepo = vehicleRepo;
    }

    public ServiceRecord getById(Long id) {
        return recordRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Service record not found: " + id));
    }

    @Transactional
    public ServiceRecord transition(Long recordId, ServiceStatus targetStatus, User actor,
                                    LocalDate scheduledDate, Integer completedOdometer) {
        ServiceRecord record = getById(recordId);

        ServiceStatus current = record.getStatus();
        ServiceStatus expectedNext = LEGAL_TRANSITIONS.get(current);

        if (expectedNext == null || expectedNext != targetStatus) {
            throw new IllegalStateException(
                    "Cannot move service record from " + current + " to " + targetStatus +
                            ". Valid next status from " + current + " is " +
                            (expectedNext != null ? expectedNext : "none — record is terminal"));
        }

        if (targetStatus == ServiceStatus.BOOKED) {
            if (scheduledDate == null) {
                throw new IllegalArgumentException("Booking requires a scheduled date");
            }
            record.setScheduledDate(scheduledDate);
        }

        if (targetStatus == ServiceStatus.COMPLETED) {
            if (completedOdometer == null) {
                throw new IllegalArgumentException("Completing a service requires the odometer reading");
            }
            Vehicle vehicle = record.getVehicle();
            LocalDate completedDate = LocalDate.now();
            record.setCompletedDate(completedDate);
            record.setCompletedOdometer(completedOdometer);

            vehicle.setLastServiceDate(completedDate);
            vehicle.setLastServiceOdometer(completedOdometer);
            vehicleRepo.save(vehicle);
        }

        record.setStatus(targetStatus);
        record.setUpdatedAt(Instant.now());
        recordRepo.save(record);

        logEvent(record, EventType.STATUS_CHANGE, current.name(), targetStatus.name(), null, actor);

        return record;
    }

    @Transactional
    public void dismissAlert(Long recordId, User actor) {
        ServiceRecord record = getById(recordId);
        record.setAlertDismissedAt(Instant.now());
        recordRepo.save(record);
        logEvent(record, EventType.NOTE, null, null, "Alert dismissed", actor);
    }

    private void logEvent(ServiceRecord record, EventType type, String oldVal, String newVal,
                          String note, User actor) {
        ServiceRecordEvent event = new ServiceRecordEvent();
        event.setServiceRecord(record);
        event.setEventType(type);
        event.setOldValue(oldVal);
        event.setNewValue(newVal);
        event.setNote(note);
        event.setPerformedBy(actor);
        eventRepo.save(event);
    }

    public Page<ServiceRecord> search(String text, ServiceStatus status, Long vehicleId,
                                      LocalDate from, LocalDate to, Pageable pageable) {
        Specification<ServiceRecord> spec = Specification
                .where(descriptionContains(text))
                .and(hasStatus(status))
                .and(hasVehicleId(vehicleId))
                .and(scheduledBetween(from, to));

        return recordRepo.findAll(spec, pageable);
    }
}
