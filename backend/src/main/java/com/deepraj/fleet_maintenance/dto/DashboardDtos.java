package com.deepraj.fleet_maintenance.dto;

import java.util.List;

public class DashboardDtos {

    public record HeadlineStats(
            long totalVehicles, long dueCount, long bookedCount,
            long inServiceCount, long completedThisMonth, long overdueCount
    ) {}

    public record WeeklyCompletedCount(String weekLabel, long count) {}

    public record DashboardResponse(HeadlineStats headline, List<WeeklyCompletedCount> weeklyChart) {}
}