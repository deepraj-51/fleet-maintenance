package com.deepraj.fleet_maintenance.controller;

import com.deepraj.fleet_maintenance.dto.EventDtos;
import com.deepraj.fleet_maintenance.dto.ServiceRecordDtos.*;
import com.deepraj.fleet_maintenance.entity.ServiceRecord;
import com.deepraj.fleet_maintenance.entity.User;
import com.deepraj.fleet_maintenance.enums.ServiceStatus;
import com.deepraj.fleet_maintenance.repository.ServiceAssignmentRepository;
import com.deepraj.fleet_maintenance.repository.ServiceRecordEventRepository;
import com.deepraj.fleet_maintenance.service.AssignmentService;
import com.deepraj.fleet_maintenance.service.ServiceRecordService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/service-records")
public class ServiceRecordController {

    private final ServiceRecordService recordService;
    private final AssignmentService assignmentService;
    private final ServiceRecordEventRepository eventRepo;
    private final ServiceAssignmentRepository assignmentRepo;

    public ServiceRecordController(ServiceRecordService recordService, AssignmentService assignmentService, ServiceRecordEventRepository eventRepo, ServiceAssignmentRepository assignmentRepo) {
        this.recordService = recordService;
        this.assignmentService = assignmentService;
        this.eventRepo = eventRepo;
        this.assignmentRepo = assignmentRepo;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRecordResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(recordService.getById(id)));
    }

    @PostMapping("/{id}/transition")
    public ResponseEntity<ServiceRecordResponse> transition(@PathVariable Long id,
                                                            @RequestBody TransitionRequest req,
                                                            @AuthenticationPrincipal User actor) {
        ServiceRecord updated = recordService.transition(
                id, req.targetStatus(), actor, req.scheduledDate(), req.completedOdometer());
        return ResponseEntity.ok(toResponse(updated));
    }

    @PostMapping("/{id}/dismiss-alert")
    public ResponseEntity<Void> dismissAlert(@PathVariable Long id, @AuthenticationPrincipal User actor) {
        recordService.dismissAlert(id, actor);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<Void> assign(@PathVariable Long id, @RequestBody AssignRequest req,
                                       @AuthenticationPrincipal User actor) {
        assignmentService.assign(id, req.technicianId(), actor);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/unassign")
    public ResponseEntity<Void> unassign(@PathVariable Long id, @RequestParam Long technicianId,
                                         @AuthenticationPrincipal User actor) {
        assignmentService.unassign(id, technicianId, actor);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<ServiceRecordResponse>> search(
            @RequestParam(required = false) String text,
            @RequestParam(required = false) ServiceStatus status,
            @RequestParam(required = false) Long vehicleId,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            Pageable pageable) {

        Page<ServiceRecordResponse> results = recordService
                .search(text, status, vehicleId, from, to, pageable)
                .map(this::toResponse);

        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<List<EventDtos.EventResponse>> getTimeline(@PathVariable Long id) {
        List<EventDtos.EventResponse> events = eventRepo.findByServiceRecordIdOrderByCreatedAtAsc(id).stream()
                .map(e -> new EventDtos.EventResponse(
                        e.getId(), e.getEventType(), e.getOldValue(), e.getNewValue(),
                        e.getNote(), e.getPerformedBy().getFullName(), e.getCreatedAt()
                ))
                .toList();
        return ResponseEntity.ok(events);
    }

    private ServiceRecordResponse toResponse(ServiceRecord r) {
        List<TechnicianSummary> technicians = assignmentRepo
                .findByServiceRecordIdAndUnassignedAtIsNull(r.getId()).stream()
                .map(a -> new TechnicianSummary(a.getTechnician().getId(), a.getTechnician().getFullName()))
                .toList();

        return new ServiceRecordResponse(
                r.getId(), r.getVehicle().getId(), r.getDescription(), r.getStatus(),
                r.getScheduledDate(), r.getCompletedDate(), r.getCompletedOdometer(),
                technicians
        );
    }
}