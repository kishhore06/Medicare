package com.medicare.demo.config;

import com.medicare.demo.dto.RegisterRequest;
import com.medicare.demo.entity.Dosage;
import com.medicare.demo.entity.Medicine;
import com.medicare.demo.enums.Category;
import com.medicare.demo.service.AuthService;
import com.medicare.demo.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final AuthService authService;
    private final MedicineService medicineService;

    @Override
    public void run(String... args) throws Exception {
        if (medicineService.getAllMedicines().isEmpty()) {
            loadDemoData();
        }
    }

    private void loadDemoData() {
        try {
            // Create Admin
            authService.register(new RegisterRequest("Admin User", "admin@medicare.com", "admin123", "ADMIN"));
            // Create User
            authService.register(new RegisterRequest("Test User", "user@medicare.com", "user123", "USER"));

            // Create Medicines
            Medicine m1 = new Medicine(null, "Paracetamol", "Pain reliever and a fever reducer.", Category.ORAL, "GlaxoSmithKline", false, null, null);
            Dosage d1 = new Dosage(null, m1, "500mg Tablet", new BigDecimal("5.00"), 100);
            Dosage d2 = new Dosage(null, m1, "650mg Tablet", new BigDecimal("7.00"), 50);
            m1.setDosages(Arrays.asList(d1, d2));
            medicineService.saveMedicine(m1);

            Medicine m2 = new Medicine(null, "Amoxicillin", "Antibiotic used to treat a number of bacterial infections.", Category.ORAL, "Pfizer", true, null, null);
            Dosage d3 = new Dosage(null, m2, "250mg Capsule", new BigDecimal("12.00"), 200);
            m2.setDosages(Arrays.asList(d3));
            medicineService.saveMedicine(m2);

            Medicine m3 = new Medicine(null, "Salbutamol", "Used to relieve symptoms of asthma.", Category.INHALED, "Cipla", true, null, null);
            Dosage d4 = new Dosage(null, m3, "100mcg Inhaler", new BigDecimal("45.00"), 30);
            m3.setDosages(Arrays.asList(d4));
            medicineService.saveMedicine(m3);

        } catch (Exception e) {
            System.out.println("Demo data already loaded or error occurred.");
        }
    }
}
