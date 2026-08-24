package com.back.project1_team1.order;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id // 주문 테이블의 기본키
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동으로 +1
    private int id;

    private String email; // 고객 이메일

    private LocalDateTime orderDate; // 주문 날짜 및 시각

    @OneToMany
    private List<OrderItem> orderItems; // 주문 상품 목록
}
