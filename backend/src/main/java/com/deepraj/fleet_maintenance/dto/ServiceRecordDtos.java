// dto/ServiceRecordDtos.java — updated
package com.deepraj.fleet_maintenance.dto;

import com.deepraj.fleet_maintenance.enums.ServiceStatus;

import java.time.LocalDate;
import java.util.List;

public class ServiceRecordDtos {

    public record TransitionRequest(ServiceStatus targetStatus, LocalDate scheduledDate, Integer completedOdometer) {}

    public record AssignRequest(Long technicianId) {}

    public record TechnicianSummary(Long id, String fullName) {}

    public record ServiceRecordResponse(
            Long id, Long vehicleId, String description, ServiceStatus status,
            LocalDate scheduledDate, LocalDate completedDate, Integer completedOdometer,
            List<TechnicianSummary> assignedTechnicians
    ) {}
}