package com.deepraj.fleet_maintenance.controller;

import com.deepraj.fleet_maintenance.dto.VehicleDtos.*;
import com.deepraj.fleet_maintenance.entity.Vehicle;
import com.deepraj.fleet_maintenance.service.VehicleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping
    public ResponseEntity<VehicleResponse> create(@RequestBody VehicleRequest req) {
        Vehicle vehicle = new Vehicle();
        vehicle.setRegistrationNumber(req.registrationNumber());
        vehicle.setMake(req.make());
        vehicle.setModel(req.model());
        vehicle.setCurrentOdometer(req.currentOdometer());
        vehicle.setDateIntervalDays(req.dateIntervalDays());
        vehicle.setMileageInterval(req.mileageInterval());

        Vehicle saved = vehicleService.create(vehicle);
        return ResponseEntity.ok(toResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponse> update(@PathVariable Long id, @RequestBody VehicleRequest req) {
        Vehicle updates = new Vehicle();
        updates.setMake(req.make());
        updates.setModel(req.model());
        updates.setCurrentOdometer(req.currentOdometer());
        updates.setDateIntervalDays(req.dateIntervalDays());
        updates.setMileageInterval(req.mileageInterval());

        Vehicle saved = vehicleService.update(id, updates);
        return ResponseEntity.ok(toResponse(saved));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(vehicleService.getById(id)));
    }

    @GetMapping
    public ResponseEntity<List<VehicleResponse>> listActive() {
        return ResponseEntity.ok(vehicleService.listActive().stream().map(this::toResponse).toList());
    }

    @GetMapping("/archived")
    public ResponseEntity<List<VehicleResponse>> listArchived() {
        return ResponseEntity.ok(vehicleService.listArchived().stream().map(this::toResponse).toList());
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<VehicleResponse> archive(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(vehicleService.archive(id)));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<VehicleResponse> restore(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(vehicleService.restore(id)));
    }

    private VehicleResponse toResponse(Vehicle v) {
        return new VehicleResponse(
                v.getId(), v.getRegistrationNumber(), v.getMake(), v.getModel(),
                v.getCurrentOdometer(), v.getDateIntervalDays(), v.getMileageInterval(),
                v.getLastServiceDate(), v.getLastServiceOdometer(), v.isArchived()
        );
    }
}
