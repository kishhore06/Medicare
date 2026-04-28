package com.medicare.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "dosages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Dosage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(nullable = false)
    private String dosageForm; // e.g., "500mg Tablet", "5ml Syrup"

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stock;
}
