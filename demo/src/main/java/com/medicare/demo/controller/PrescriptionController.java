package com.medicare.demo.controller;

import com.medicare.demo.entity.Prescription;
import com.medicare.demo.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping("/upload")
    public ResponseEntity<Prescription> uploadPrescription(Authentication authentication, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(prescriptionService.uploadPrescription(authentication.getName(), file));
    }

    @GetMapping
    public ResponseEntity<List<Prescription>> getUserPrescriptions(Authentication authentication) {
        return ResponseEntity.ok(prescriptionService.getUserPrescriptions(authentication.getName()));
    }
}
