package com.medicare.demo.service;

import com.medicare.demo.dto.CartItemRequest;
import com.medicare.demo.entity.Cart;
import com.medicare.demo.entity.CartItem;
import com.medicare.demo.entity.Dosage;
import com.medicare.demo.entity.Medicine;
import com.medicare.demo.entity.User;
import com.medicare.demo.repository.CartItemRepository;
import com.medicare.demo.repository.CartRepository;
import com.medicare.demo.repository.DosageRepository;
import com.medicare.demo.repository.MedicineRepository;
import com.medicare.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final MedicineRepository medicineRepository;
    private final DosageRepository dosageRepository;
    private final UserRepository userRepository;

    public Cart getCartByUserEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return cartRepository.findByUserId(user.getId()).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });
    }

    @Transactional
    public Cart addToCart(String email, CartItemRequest request) {
        Cart cart = getCartByUserEmail(email);
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
        Dosage dosage = dosageRepository.findById(request.getDosageId())
                .orElseThrow(() -> new RuntimeException("Dosage not found"));

        Optional<CartItem> existingItem = cart.getCartItems().stream()
                .filter(item -> item.getDosage().getId().equals(dosage.getId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setMedicine(medicine);
            newItem.setDosage(dosage);
            newItem.setQuantity(request.getQuantity());
            cart.getCartItems().add(newItem);
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeFromCart(String email, Long cartItemId) {
        Cart cart = getCartByUserEmail(email);
        cart.getCartItems().removeIf(item -> item.getId().equals(cartItemId));
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart clearCart(String email) {
        Cart cart = getCartByUserEmail(email);
        cart.getCartItems().clear();
        return cartRepository.save(cart);
    }
}
