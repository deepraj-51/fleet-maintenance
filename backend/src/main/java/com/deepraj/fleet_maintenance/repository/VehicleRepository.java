package com.deepraj.fleet_maintenance.repository;

import com.deepraj.fleet_maintenance.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByArchivedFalse();
    List<Vehicle> findByArchivedTrue();
    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);
    boolean existsByRegistrationNumber(String registrationNumber);
}