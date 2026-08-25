package com.back.project1_team1.order.dto;

import com.back.project1_team1.order.Order;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(

    Long orderId,
    String email,
    LocalDateTime orderDate,
    int totalAmount,
    List<OrderItemResponse> items

) {


    public static OrderResponse from(Order order) {
        // 주문 내 포함된 OrderItem 엔티티들을 OrderItemResponse DTO 목록으로 변환
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream()
            .map(OrderItemResponse::from)
            .toList();

        // 각 품목별 합계(itemTotalPrice)를 모두 더해 최종 총 결제 금액 계산
        int calculatedTotalAmount = itemResponses.stream()
            .mapToInt(OrderItemResponse::itemTotalPrice)
            .sum();

        // 묶어서 반환
        return new OrderResponse(
            order.getId(),
            order.getEmail(),
            order.getOrderDate(),
            calculatedTotalAmount,
            itemResponses
        );

    }

}
