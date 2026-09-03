package com.deepraj.fleet_maintenance.repository;

import com.deepraj.fleet_maintenance.entity.ServiceRecord;
import com.deepraj.fleet_maintenance.enums.ServiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ServiceRecordRepository extends JpaRepository<ServiceRecord, Long>,
        JpaSpecificationExecutor<ServiceRecord> {

    List<ServiceRecord> findByStatus(ServiceStatus status);

    List<ServiceRecord> findByVehicleId(Long vehicleId);

    boolean existsByVehicleIdAndStatusIn(Long vehicleId, List<ServiceStatus> statuses);

    @Query("SELECT sr FROM ServiceRecord sr JOIN sr.assignments a " +
            "WHERE a.technician.id = :technicianId AND a.unassignedAt IS NULL")
    List<ServiceRecord> findActiveByTechnician(@Param("technicianId") Long technicianId);

    @Query("SELECT COUNT(sr) FROM ServiceRecord sr WHERE sr.status = 'COMPLETED' " +
            "AND sr.completedDate >= :monthStart")
    long countCompletedSince(@Param("monthStart") java.time.LocalDate monthStart);

    @Query("SELECT COUNT(sr) FROM ServiceRecord sr WHERE sr.status IN ('DUE','BOOKED') " +
            "AND sr.scheduledDate IS NOT NULL AND sr.scheduledDate < CURRENT_DATE")
    long countOverdue();

    @Query("SELECT sr FROM ServiceRecord sr WHERE sr.status = 'COMPLETED' " +
            "AND sr.completedDate >= :since ORDER BY sr.completedDate")
    List<ServiceRecord> findCompletedSince(@Param("since") java.time.LocalDate since);
}