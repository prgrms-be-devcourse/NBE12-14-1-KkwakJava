package com.back.project1_team1.order.entity;

import com.back.project1_team1.product.entity.Product;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "order_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OrderItem {

    @Id // 주문 상품 테이블의 기본키
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동으로 +1
    private Long id;

    // 지연로딩 설정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id") // 주문 테이블과 join
    private Order order; // 주문 테이블 객체

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id") // 상품 테이블과 join
    private Product product; // 상품 테이블 객체

    private int quantity; // 해당 주문 상품 수량

    public OrderItem(Order order, Product product, int quantity) {
        this.order = order;
        this.product = product;
        this.quantity = quantity;
    }

    public void updateQuantity(int quantity) {
        this.quantity = quantity;
    }
}