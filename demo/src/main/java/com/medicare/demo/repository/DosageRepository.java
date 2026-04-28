package com.medicare.demo.repository;

import com.medicare.demo.entity.Dosage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DosageRepository extends JpaRepository<Dosage, Long> {
}
