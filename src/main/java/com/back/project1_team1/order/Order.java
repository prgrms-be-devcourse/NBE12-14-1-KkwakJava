package com.back.project1_team1.order;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order {

    @Id // 주문 테이블의 기본키
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동으로 +1
    private int id;

    private String email;

    // 주문 날짜 및 시각
    // 클라이언트가 전달하지 않고 주문 생성 시 서버에서 자동으로 생성
    private LocalDateTime orderDate;

    @OneToMany
    private List<OrderItem> orderItems; // 주문 상품 목록
}
