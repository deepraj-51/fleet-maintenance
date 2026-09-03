package com.deepraj.fleet_maintenance.dto;

import com.deepraj.fleet_maintenance.enums.EventType;

import java.time.Instant;

public class EventDtos {

    public record EventResponse(
            Long id, EventType eventType, String oldValue, String newValue,
            String note, String performedByName, Instant createdAt
    ) {}
}