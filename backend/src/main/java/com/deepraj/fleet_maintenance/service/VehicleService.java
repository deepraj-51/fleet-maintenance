package com.deepraj.fleet_maintenance.service;

import com.deepraj.fleet_maintenance.entity.Vehicle;
import com.deepraj.fleet_maintenance.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepo;

    public VehicleService(VehicleRepository vehicleRepo) {
        this.vehicleRepo = vehicleRepo;
    }

    public Vehicle create(Vehicle vehicle) {
        if (vehicleRepo.existsByRegistrationNumber(vehicle.getRegistrationNumber())) {
            throw new IllegalArgumentException(
                    "A vehicle with registration number " + vehicle.getRegistrationNumber() + " already exists");
        }
        return vehicleRepo.save(vehicle);
    }

    public Vehicle update(Long id, Vehicle updates) {
        Vehicle existing = getById(id);
        existing.setMake(updates.getMake());
        existing.setModel(updates.getModel());
        existing.setCurrentOdometer(updates.getCurrentOdometer());
        existing.setDateIntervalDays(updates.getDateIntervalDays());
        existing.setMileageInterval(updates.getMileageInterval());
        return vehicleRepo.save(existing);
    }

    public Vehicle getById(Long id) {
        return vehicleRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + id));
    }

    public List<Vehicle> listActive() {
        return vehicleRepo.findByArchivedFalse();
    }

    public List<Vehicle> listArchived() {
        return vehicleRepo.findByArchivedTrue();
    }

    public Vehicle archive(Long id) {
        Vehicle vehicle = getById(id);
        vehicle.setArchived(true);
        return vehicleRepo.save(vehicle);
    }

    public Vehicle restore(Long id) {
        Vehicle vehicle = getById(id);
        vehicle.setArchived(false);
        return vehicleRepo.save(vehicle);
    }
}
