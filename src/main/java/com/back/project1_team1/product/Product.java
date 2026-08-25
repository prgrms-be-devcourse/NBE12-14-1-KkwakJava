package com.back.project1_team1.product;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Table(name = "products")
@Getter
public class Product {

    @Id // 상품 테이블의 기본키
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동으로 +1
    private int id;

    private String name; // 상품명

    private int price; // 상품 가격
}
