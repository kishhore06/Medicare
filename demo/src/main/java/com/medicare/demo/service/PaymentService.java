package com.medicare.demo.service;

import com.medicare.demo.entity.Cart;
import com.medicare.demo.entity.CartItem;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    private final CartService cartService;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public Map<String, Object> createPaymentIntent(String email) throws StripeException {
        Cart cart = cartService.getCartByUserEmail(email);
        
        if (cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem ci : cart.getCartItems()) {
            BigDecimal itemTotal = ci.getDosage().getPrice().multiply(new BigDecimal(ci.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }
        
        // Add $5 shipping fee as per frontend logic
        totalAmount = totalAmount.add(new BigDecimal("5.00"));

        // Convert to cents for Stripe
        long amountInCents = totalAmount.multiply(new BigDecimal("100")).longValue();

        PaymentIntentCreateParams params =
            PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("clientSecret", paymentIntent.getClientSecret());
        responseData.put("amount", totalAmount);

        return responseData;
    }
}
