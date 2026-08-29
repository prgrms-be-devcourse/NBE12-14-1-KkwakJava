package com.back.project1_team1.product.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AccessLevel;

@Entity
@Getter
@Table(
        name = "products",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "name")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {

    @Id // 상품 테이블의 기본키
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동으로 +1
    private Long id;

    @Column(unique = true)
    private String name; // 상품명

    private int price; // 상품 가격

    private String imageUrl;  // 상품 이미지 url

    // 상품 등록시 사용하는 생성자
    public Product(String name, int price, String imageUrl) {
        this.name = name;
        this.price = price;
        this.imageUrl = imageUrl;
    }

    // Setter 대신 수정 메서드
    public void update(String name, int price, String imageUrl) {
        this.name = name;
        this.price = price;
        this.imageUrl = imageUrl;
    }
}
