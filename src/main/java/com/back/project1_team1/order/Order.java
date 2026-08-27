package com.back.project1_team1.order;

import com.back.project1_team1.product.Product;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order {

    // 배송 마감 시각(매일 14시 기준으로 전날 14시~당일 14시 주문을 묶어 배송)
    private static final LocalTime DELIVERY_CUTOFF_TIME = LocalTime.of(14, 0);

    @Id // 주문 테이블의 기본키
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동으로 +1
    private Long id;

    private String email;

    private String postalCode; // 우편번호
    private String address; // 주소

    // 주문 날짜 및 시각
    // 클라이언트가 전달하지 않고 주문 생성 시 서버에서 자동으로 생성
    private LocalDateTime orderDate;

    // mappedBy = "order": 연관관계의 주인인 OrderItem.order에 외래키 관리를 위임(불필요한 중간 조인 테이블 생성 방지)
    // 부모 저장/삭제 시 자식 자동 반영(cascade) 및 부모와 연결 끊긴 자식 자동 삭제(orphanRemoval)
    @OneToMany(mappedBy = "order", cascade = {CascadeType.PERSIST,
        CascadeType.REMOVE}, orphanRemoval = true)

    private List<OrderItem> orderItems = new ArrayList<>(); // 주문 상품 목록


    public Order(
        String email,
        String postalCode,
        String address,
        LocalDateTime orderDate
    ) {
        this.email = email;
        this.postalCode = postalCode;
        this.address = address;
        this.orderDate = orderDate;
    }


    // 연관관계 편의 메서드 (Order와 OrderItem을 동시에 연결)
    public void addOrderItem(Product product, int quantity) {
        OrderItem item = new OrderItem(this, product, quantity);
        this.orderItems.add(item);
    }

    // 이 주문이 속한 배송 묶음의 마감(발송) 시각이 현재 지났는지 여부
    public boolean isAlreadyDelivered(LocalDateTime now) {
        LocalDateTime deliveredAt = orderDate.toLocalTime().isBefore(DELIVERY_CUTOFF_TIME)
            ? orderDate.toLocalDate().atTime(DELIVERY_CUTOFF_TIME)
            : orderDate.toLocalDate().plusDays(1).atTime(DELIVERY_CUTOFF_TIME);

        return !now.isBefore(deliveredAt);
    }

    public void updateDeliveryAddress(String postalCode, String address){
        this.postalCode = postalCode;
        this.address = address;
    }
    public void clearOrderItems(){
        this.orderItems.clear();
    }



}
