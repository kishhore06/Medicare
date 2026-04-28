package com.medicare.demo.repository;

import com.medicare.demo.entity.Medicine;
import com.medicare.demo.enums.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByCategory(Category category);
}
