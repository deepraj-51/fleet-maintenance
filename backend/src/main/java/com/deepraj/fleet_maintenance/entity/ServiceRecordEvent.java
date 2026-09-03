package com.deepraj.fleet_maintenance.entity;

import com.deepraj.fleet_maintenance.enums.EventType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "service_record_events")
@Getter
@Setter
@NoArgsConstructor
public class ServiceRecordEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_record_id", nullable = false)
    private ServiceRecord serviceRecord;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType eventType;

    private String oldValue;
    private String newValue;
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by", nullable = false)
    private User performedBy;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}
