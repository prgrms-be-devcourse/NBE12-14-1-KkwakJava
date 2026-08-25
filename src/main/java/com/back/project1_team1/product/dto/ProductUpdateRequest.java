package com.back.project1_team1.product.dto;

public record ProductUpdateRequest(
        String name,
        int price
) {
}