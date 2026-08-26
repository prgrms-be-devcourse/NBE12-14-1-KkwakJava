package com.back.project1_team1.order.dto;

/*
    주문 생성 요청에 포함되는 개별 상품 정보를 담는 DTO
    상품 ID와 주문 수량을 전달받음
 */

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record OrderItemRequest(

    @NotNull(message = "상품 ID는 필수입니다.")
    Long productId, // 주문할 상품의 ID

    @Min(value = 1, message = "상품 수량은 1개 이상이어야 합니다.")
    int quantity // 주문할 상품의 수량
) {


}
