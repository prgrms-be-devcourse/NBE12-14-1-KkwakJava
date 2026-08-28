package com.back.project1_team1.order.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DeliveryOrderResponse {
    private Long deliveryId;
    private String email;
    private String postalCode;
    private String address;

    // 병합된 주문 중 가장 최근 주문일
    private LocalDateTime orderDate;

    // 배송 기준 14시가 지났는지 여부
    private boolean deliveryCompleted;

    private int totalAmount;
    private List<DeliveryItemResponse> items;

    public record DeliveryItemResponse(
        Long productId,
        String productName,
        String imageUrl,
        int unitPrice,
        int quantity,
        int itemTotalPrice

    ) {
    }
}