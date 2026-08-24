package com.back.project1_team1.order.dto;

/*
    주문 생성 요청에 포함되는 개별 상품 정보를 담는 DTO
    상품 ID와 주문 수량을 전달받음
 */

public class OrderItemRequest {

    private int productId; // 주문할 상품의 ID
    private int quantity; // 주문할 상품의 수량
}
