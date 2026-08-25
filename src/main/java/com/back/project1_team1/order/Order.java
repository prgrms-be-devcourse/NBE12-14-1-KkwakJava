package com.back.project1_team1.order;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order {

    @Id // 주문 테이블의 기본키
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동으로 +1
    private int id;

    private String email;

    // 주문 날짜 및 시각
    // 클라이언트가 전달하지 않고 주문 생성 시 서버에서 자동으로 생성
    private LocalDateTime orderDate;

    // mappedBy = "order": 연관관계의 주인인 OrderItem.order에 외래키 관리를 위임(불필요한 중간 조인 테이블 생성 방지)
    // 부모 저장/삭제 시 자식 자동 반영(cascade) 및 부모와 연결 끊긴 자식 자동 삭제(orphanRemoval)
    @OneToMany(mappedBy = "order", cascade = {CascadeType.PERSIST,
        CascadeType.REMOVE}, orphanRemoval = true)
    private List<OrderItem> orderItems; // 주문 상품 목록

    public Order(String email, LocalDateTime orderDate) {
        this.email = email;
        this.orderDate = orderDate;
    }
}
