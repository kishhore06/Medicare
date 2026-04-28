package com.medicare.demo.controller;

import com.medicare.demo.dto.CartItemRequest;
import com.medicare.demo.entity.Cart;
import com.medicare.demo.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<Cart> getCart(Authentication authentication) {
        return ResponseEntity.ok(cartService.getCartByUserEmail(authentication.getName()));
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(Authentication authentication, @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addToCart(authentication.getName(), request));
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<Cart> removeFromCart(Authentication authentication, @PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeFromCart(authentication.getName(), itemId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Cart> clearCart(Authentication authentication) {
        return ResponseEntity.ok(cartService.clearCart(authentication.getName()));
    }
}
