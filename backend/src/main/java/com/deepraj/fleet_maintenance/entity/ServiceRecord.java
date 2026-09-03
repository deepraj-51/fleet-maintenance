package com.deepraj.fleet_maintenance.entity;

import com.deepraj.fleet_maintenance.enums.ServiceStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "service_records")
@Getter
@Setter
@NoArgsConstructor
public class ServiceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceStatus status = ServiceStatus.DUE;

    private LocalDate scheduledDate;
    private LocalDate completedDate;
    private Integer completedOdometer;

    @Column(nullable = false)
    private Instant becameDueAt = Instant.now();

    private Instant alertDismissedAt;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "serviceRecord", cascade = CascadeType.PERSIST)
    private List<ServiceAssignment> assignments = new ArrayList<>();

    @OneToMany(mappedBy = "serviceRecord", cascade = CascadeType.PERSIST)
    private List<ServiceRecordEvent> events = new ArrayList<>();
}
