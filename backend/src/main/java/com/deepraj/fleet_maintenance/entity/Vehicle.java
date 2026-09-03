package com.deepraj.fleet_maintenance.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String registrationNumber;

    @Column(nullable = false)
    private String make;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private Integer currentOdometer;

    @Column(nullable = false)
    private Integer dateIntervalDays;

    @Column(nullable = false)
    private Integer mileageInterval;

    private LocalDate lastServiceDate;
    private Integer lastServiceOdometer;

    @Column(nullable = false)
    private boolean archived = false;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.PERSIST)
    private List<ServiceRecord> serviceRecords = new ArrayList<>();
}
