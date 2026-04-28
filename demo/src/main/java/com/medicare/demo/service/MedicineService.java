package com.medicare.demo.service;

import com.medicare.demo.entity.Medicine;
import com.medicare.demo.enums.Category;
import com.medicare.demo.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;

    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    public List<Medicine> getMedicinesByCategory(String category) {
        try {
            Category cat = Category.valueOf(category.toUpperCase());
            return medicineRepository.findByCategory(cat);
        } catch (Exception e) {
            return List.of();
        }
    }

    public Medicine getMedicineById(Long id) {
        return medicineRepository.findById(id).orElseThrow(() -> new RuntimeException("Medicine not found"));
    }

    public Medicine saveMedicine(Medicine medicine) {
        if (medicine.getDosages() != null) {
            medicine.getDosages().forEach(d -> d.setMedicine(medicine));
        }
        return medicineRepository.save(medicine);
    }

    public Medicine updateMedicine(Long id, Medicine updatedMedicine) {
        Medicine existing = getMedicineById(id);
        existing.setName(updatedMedicine.getName());
        existing.setDescription(updatedMedicine.getDescription());
        existing.setCategory(updatedMedicine.getCategory());
        existing.setManufacturer(updatedMedicine.getManufacturer());
        existing.setRequiresPrescription(updatedMedicine.getRequiresPrescription());
        existing.setImageUrl(updatedMedicine.getImageUrl());
        
        if (updatedMedicine.getDosages() != null) {
            existing.getDosages().clear();
            updatedMedicine.getDosages().forEach(d -> {
                d.setMedicine(existing);
                existing.getDosages().add(d);
            });
        }
        return medicineRepository.save(existing);
    }
    
    public void deleteMedicine(Long id) {
        medicineRepository.deleteById(id);
    }
}
