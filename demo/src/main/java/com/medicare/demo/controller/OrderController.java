package com.medicare.demo.controller;

import com.medicare.demo.dto.OrderRequest;
import com.medicare.demo.entity.Order;
import com.medicare.demo.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> placeOrder(Authentication authentication, @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.placeOrder(authentication.getName(), request));
    }

    @GetMapping
    public ResponseEntity<List<Order>> getUserOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getUserOrders(authentication.getName()));
    }
}
