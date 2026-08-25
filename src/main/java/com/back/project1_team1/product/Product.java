package com.back.project1_team1.product;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {

    @Id // 상품 테이블의 기본키
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동으로 +1
    private Long id;

    private String name; // 상품명

    private int price; // 상품 가격

    public Product(String name, int price) {
        this.name = name;
        this.price = price;
    }
}
