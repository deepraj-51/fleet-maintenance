package com.deepraj.fleet_maintenance.specification;

import com.deepraj.fleet_maintenance.entity.ServiceRecord;
import com.deepraj.fleet_maintenance.enums.ServiceStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class ServiceRecordSpecifications {

    public static Specification<ServiceRecord> hasStatus(ServiceStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<ServiceRecord> hasVehicleId(Long vehicleId) {
        return (root, query, cb) -> vehicleId == null ? null : cb.equal(root.get("vehicle").get("id"), vehicleId);
    }

    public static Specification<ServiceRecord> scheduledBetween(LocalDate from, LocalDate to) {
        return (root, query, cb) -> {
            if (from == null && to == null) return null;
            if (from != null && to != null) return cb.between(root.get("scheduledDate"), from, to);
            if (from != null) return cb.greaterThanOrEqualTo(root.get("scheduledDate"), from);
            return cb.lessThanOrEqualTo(root.get("scheduledDate"), to);
        };
    }

    public static Specification<ServiceRecord> descriptionContains(String text) {
        return (root, query, cb) -> {
            if (text == null || text.isBlank()) return null;
            return cb.like(cb.lower(root.get("description")), "%" + text.toLowerCase() + "%");
        };
    }
}
