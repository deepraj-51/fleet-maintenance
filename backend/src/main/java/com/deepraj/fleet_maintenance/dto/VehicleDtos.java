package com.deepraj.fleet_maintenance.dto;

import java.time.LocalDate;

public class VehicleDtos {

    public record VehicleRequest(
            String registrationNumber,
            String make,
            String model,
            Integer currentOdometer,
            Integer dateIntervalDays,
            Integer mileageInterval
    ) {}

    public record VehicleResponse(
            Long id,
            String registrationNumber,
            String make,
            String model,
            Integer currentOdometer,
            Integer dateIntervalDays,
            Integer mileageInterval,
            LocalDate lastServiceDate,
            Integer lastServiceOdometer,
            boolean archived
    ) {}
}
