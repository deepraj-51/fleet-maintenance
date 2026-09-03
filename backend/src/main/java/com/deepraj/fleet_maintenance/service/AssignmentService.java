package com.deepraj.fleet_maintenance.service;

import com.deepraj.fleet_maintenance.entity.*;
import com.deepraj.fleet_maintenance.enums.EventType;
import com.deepraj.fleet_maintenance.repository.ServiceAssignmentRepository;
import com.deepraj.fleet_maintenance.repository.ServiceRecordEventRepository;
import com.deepraj.fleet_maintenance.repository.ServiceRecordRepository;
import com.deepraj.fleet_maintenance.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AssignmentService {

    private final ServiceAssignmentRepository assignmentRepo;
    private final ServiceRecordRepository recordRepo;
    private final UserRepository userRepo;
    private final ServiceRecordEventRepository eventRepo;

    public AssignmentService(ServiceAssignmentRepository assignmentRepo, ServiceRecordRepository recordRepo,
                             UserRepository userRepo, ServiceRecordEventRepository eventRepo) {
        this.assignmentRepo = assignmentRepo;
        this.recordRepo = recordRepo;
        this.userRepo = userRepo;
        this.eventRepo = eventRepo;
    }

    @Transactional
    public ServiceAssignment assign(Long recordId, Long technicianId, User actor) {
        ServiceRecord record = recordRepo.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Service record not found: " + recordId));
        User technician = userRepo.findById(technicianId)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found: " + technicianId));

        boolean alreadyAssigned = assignmentRepo
                .findByServiceRecordIdAndUnassignedAtIsNull(recordId).stream()
                .anyMatch(a -> a.getTechnician().getId().equals(technicianId));

        if (alreadyAssigned) {
            throw new IllegalStateException("Technician is already assigned to this record");
        }

        ServiceAssignment assignment = new ServiceAssignment();
        assignment.setServiceRecord(record);
        assignment.setTechnician(technician);
        assignmentRepo.save(assignment);

        logEvent(record, EventType.ASSIGNED, null, technician.getFullName(), actor);
        return assignment;
    }

    @Transactional
    public void unassign(Long recordId, Long technicianId, User actor) {
        ServiceAssignment assignment = assignmentRepo
                .findByServiceRecordIdAndUnassignedAtIsNull(recordId).stream()
                .filter(a -> a.getTechnician().getId().equals(technicianId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Technician is not currently assigned to this record"));

        assignment.setUnassignedAt(Instant.now());
        assignmentRepo.save(assignment);

        logEvent(assignment.getServiceRecord(), EventType.UNASSIGNED, assignment.getTechnician().getFullName(), null, actor);
    }

    private void logEvent(ServiceRecord record, EventType type, String oldVal, String newVal, User actor) {
        ServiceRecordEvent event = new ServiceRecordEvent();
        event.setServiceRecord(record);
        event.setEventType(type);
        event.setOldValue(oldVal);
        event.setNewValue(newVal);
        event.setPerformedBy(actor);
        eventRepo.save(event);
    }
}
