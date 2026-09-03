package com.deepraj.fleet_maintenance.dto;

public class UserDtos {
    public record UserSummary(Long id, String fullName, String email) {}
}