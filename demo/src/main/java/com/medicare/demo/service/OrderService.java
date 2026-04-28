package com.medicare.demo.service;

import com.medicare.demo.dto.OrderRequest;
import com.medicare.demo.entity.*;
import com.medicare.demo.enums.OrderStatus;
import com.medicare.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final MedicineRepository medicineRepository;
    private final DosageRepository dosageRepository;
    private final PrescriptionRepository prescriptionRepository;

    @Transactional
    public Order placeOrder(String email, OrderRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PLACED);
        
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        boolean requiresPrescription = false;

        if (request.isFromCart()) {
            Cart cart = cartService.getCartByUserEmail(email);
            if (cart.getCartItems().isEmpty()) {
                throw new RuntimeException("Cart is empty");
            }

            for (CartItem ci : cart.getCartItems()) {
                OrderItem oi = new OrderItem();
                oi.setOrder(order);
                oi.setMedicine(ci.getMedicine());
                oi.setDosage(ci.getDosage());
                oi.setQuantity(ci.getQuantity());
                oi.setPrice(ci.getDosage().getPrice());
                
                totalAmount = totalAmount.add(oi.getPrice().multiply(new BigDecimal(oi.getQuantity())));
                orderItems.add(oi);
                
                if (ci.getMedicine().getRequiresPrescription()) {
                    requiresPrescription = true;
                }
                
                // Deduct stock
                Dosage d = ci.getDosage();
                if (d.getStock() < ci.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for " + ci.getMedicine().getName());
                }
                d.setStock(d.getStock() - ci.getQuantity());
            }
            cartService.clearCart(email);
        } else {
            Medicine medicine = medicineRepository.findById(request.getMedicineId())
                    .orElseThrow(() -> new RuntimeException("Medicine not found"));
            Dosage dosage = dosageRepository.findById(request.getDosageId())
                    .orElseThrow(() -> new RuntimeException("Dosage not found"));
                    
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setMedicine(medicine);
            oi.setDosage(dosage);
            oi.setQuantity(request.getQuantity());
            oi.setPrice(dosage.getPrice());
            
            totalAmount = totalAmount.add(oi.getPrice().multiply(new BigDecimal(oi.getQuantity())));
            orderItems.add(oi);
            
            if (medicine.getRequiresPrescription()) {
                requiresPrescription = true;
            }
            
            // Deduct stock
            if (dosage.getStock() < request.getQuantity()) {
                throw new RuntimeException("Insufficient stock for " + medicine.getName());
            }
            dosage.setStock(dosage.getStock() - request.getQuantity());
        }

        if (requiresPrescription) {
            if (request.getPrescriptionId() == null) {
                throw new RuntimeException("Prescription required for some items");
            }
            Prescription p = prescriptionRepository.findById(request.getPrescriptionId())
                    .orElseThrow(() -> new RuntimeException("Prescription not found"));
            if (!p.getStatus().name().equals("APPROVED")) {
                throw new RuntimeException("Prescription is not approved yet");
            }
            order.setPrescription(p);
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount);
        return orderRepository.save(order);
    }

    public List<Order> getUserOrders(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUserIdOrderByOrderDateDesc(user.getId());
    }
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public Order updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
