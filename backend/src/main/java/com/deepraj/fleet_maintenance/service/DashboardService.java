package com.deepraj.fleet_maintenance.service;

import com.deepraj.fleet_maintenance.dto.DashboardDtos.*;
import com.deepraj.fleet_maintenance.entity.ServiceRecord;
import com.deepraj.fleet_maintenance.enums.ServiceStatus;
import com.deepraj.fleet_maintenance.repository.ServiceRecordRepository;
import com.deepraj.fleet_maintenance.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final VehicleRepository vehicleRepo;
    private final ServiceRecordRepository recordRepo;

    public DashboardService(VehicleRepository vehicleRepo, ServiceRecordRepository recordRepo) {
        this.vehicleRepo = vehicleRepo;
        this.recordRepo = recordRepo;
    }

    public DashboardResponse getDashboard() {
        long totalVehicles = vehicleRepo.findByArchivedFalse().size();
        long dueCount = recordRepo.findByStatus(ServiceStatus.DUE).size();
        long bookedCount = recordRepo.findByStatus(ServiceStatus.BOOKED).size();
        long inServiceCount = recordRepo.findByStatus(ServiceStatus.IN_SERVICE).size();

        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        long completedThisMonth = recordRepo.countCompletedSince(monthStart);
        long overdueCount = recordRepo.countOverdue();

        HeadlineStats headline = new HeadlineStats(
                totalVehicles, dueCount, bookedCount, inServiceCount, completedThisMonth, overdueCount);

        List<WeeklyCompletedCount> weeklyChart = buildWeeklyChart();

        return new DashboardResponse(headline, weeklyChart);
    }

    private List<WeeklyCompletedCount> buildWeeklyChart() {
        LocalDate today = LocalDate.now();
        LocalDate eightWeeksAgo = today.minusWeeks(8).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        List<ServiceRecord> completed = recordRepo.findCompletedSince(eightWeeksAgo);

        // bucket by week-start (Monday)
        Map<LocalDate, Long> byWeek = completed.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getCompletedDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)),
                        Collectors.counting()
                ));

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d");
        List<WeeklyCompletedCount> result = new ArrayList<>();

        for (int i = 7; i >= 0; i--) {
            LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).minusWeeks(i);
            long count = byWeek.getOrDefault(weekStart, 0L);
            result.add(new WeeklyCompletedCount(weekStart.format(fmt), count));
        }

        return result;
    }
}
