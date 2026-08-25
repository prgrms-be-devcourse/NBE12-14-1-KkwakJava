package com.back.project1_team1.order;

import com.back.project1_team1.product.Product;
import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem{

    @Id // 주문 상품 테이블의 기본키
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동으로 +1
    private int id;

    // 지연로딩 설정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id") // 주문 테이블과 join
    private Order order; // 주문 테이블 객체

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id") // 상품 테이블과 join
    private Product product; // 상품 테이블 객체

    private int quantity; // 해당 주문 상품 수량
}