package com.medicare.demo.repository;

import com.medicare.demo.entity.Prescription;
import com.medicare.demo.enums.PrescriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByUserId(Long userId);
    List<Prescription> findByStatus(PrescriptionStatus status);
}
