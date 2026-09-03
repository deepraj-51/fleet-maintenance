package com.deepraj.fleet_maintenance.dto;

import java.util.List;

public class CsvDtos {

    public record RowResult(int rowNumber, String registrationNumber, boolean success, String message) {}

    public record BulkUploadReport(int totalRows, int successCount, int failureCount, List<RowResult> rows) {}
}
