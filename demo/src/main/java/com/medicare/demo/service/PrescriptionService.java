package com.medicare.demo.service;

import com.medicare.demo.entity.Prescription;
import com.medicare.demo.entity.User;
import com.medicare.demo.enums.PrescriptionStatus;
import com.medicare.demo.repository.PrescriptionRepository;
import com.medicare.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public Prescription uploadPrescription(String email, MultipartFile file) {
        try {
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = StringUtils.cleanPath(System.currentTimeMillis() + "_" + file.getOriginalFilename());
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            Prescription prescription = new Prescription();
            prescription.setUser(user);
            prescription.setFilePath(fileName);
            prescription.setStatus(PrescriptionStatus.PENDING);
            
            return prescriptionRepository.save(prescription);

        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Please try again!", ex);
        }
    }

    public List<Prescription> getUserPrescriptions(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return prescriptionRepository.findByUserId(user.getId());
    }

    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }

    public Prescription updatePrescriptionStatus(Long id, PrescriptionStatus status) {
        Prescription p = prescriptionRepository.findById(id).orElseThrow(() -> new RuntimeException("Prescription not found"));
        p.setStatus(status);
        return prescriptionRepository.save(p);
    }
}
