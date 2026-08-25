package com.back.project1_team1.order.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DeliveryOrderResponse {

    private int id; // 주문 ID
    private String email; // 주문 고객 이메일
    private LocalDateTime orderDate; // 주문 생성 날짜 및 시각

}
