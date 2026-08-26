package com.back.project1_team1.product.dto;

import com.back.project1_team1.product.Product;

public record ProductResponse(
        Long id,
        String name,
        int price
) {
    // Product Entity를 ProductResponse DTO로 변환하는 생성자
    public ProductResponse(Product product) {
        this(
                product.getId(),
                product.getName(),
                product.getPrice()
        );
    }
}