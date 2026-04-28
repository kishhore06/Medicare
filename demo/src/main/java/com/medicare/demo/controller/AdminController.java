package com.medicare.demo.controller;

import com.medicare.demo.entity.Order;
import com.medicare.demo.entity.Prescription;
import com.medicare.demo.enums.OrderStatus;
import com.medicare.demo.enums.PrescriptionStatus;
import com.medicare.demo.service.OrderService;
import com.medicare.demo.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final OrderService orderService;
    private final PrescriptionService prescriptionService;

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<List<Prescription>> getAllPrescriptions() {
        return ResponseEntity.ok(prescriptionService.getAllPrescriptions());
    }

    @PutMapping("/prescriptions/{id}/status")
    public ResponseEntity<Prescription> updatePrescriptionStatus(@PathVariable Long id, @RequestParam PrescriptionStatus status) {
        return ResponseEntity.ok(prescriptionService.updatePrescriptionStatus(id, status));
    }
}
