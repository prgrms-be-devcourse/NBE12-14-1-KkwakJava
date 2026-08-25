package com.back.project1_team1.product.dto;

import com.back.project1_team1.product.Product;

public record ProductResponse(
        int id,
        String name,
        int price
) {
    public ProductResponse(Product product) {
        this(
                product.getId(),
                product.getName(),
                product.getPrice()
        );
    }
}