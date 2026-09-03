package com.deepraj.fleet_maintenance.repository;

import com.deepraj.fleet_maintenance.entity.ServiceRecordEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRecordEventRepository extends JpaRepository<ServiceRecordEvent, Long> {
    List<ServiceRecordEvent> findByServiceRecordIdOrderByCreatedAtAsc(Long serviceRecordId);
    // deliberately no update/delete methods — this repository is append-only by design
}
