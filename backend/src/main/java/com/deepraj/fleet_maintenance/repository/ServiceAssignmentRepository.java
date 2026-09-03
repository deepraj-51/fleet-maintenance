package com.deepraj.fleet_maintenance.repository;

import com.deepraj.fleet_maintenance.entity.ServiceAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceAssignmentRepository extends JpaRepository<ServiceAssignment, Long> {
    List<ServiceAssignment> findByServiceRecordIdAndUnassignedAtIsNull(Long serviceRecordId);
    List<ServiceAssignment> findByTechnicianIdAndUnassignedAtIsNull(Long technicianId);
}