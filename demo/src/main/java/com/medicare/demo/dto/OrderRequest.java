package com.medicare.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderRequest {
    // If order is from cart, this can be empty or we just pass a boolean
    // If it's a single item, we might pass medicineId, dosageId, quantity
    private boolean fromCart;
    private Long medicineId;
    private Long dosageId;
    private Integer quantity;
    private Long prescriptionId; // Optional depending on medicine
}
