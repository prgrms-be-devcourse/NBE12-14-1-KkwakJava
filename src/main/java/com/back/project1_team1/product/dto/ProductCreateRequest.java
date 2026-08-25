package com.back.project1_team1.product.dto;

import lombok.Getter;

@Getter
public class ProductCreateRequest {

    private String name;        // 상품명

    private int price;          // 상품가격
}