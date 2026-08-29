package com.back.project1_team1.order.dto;

import com.back.project1_team1.order.entity.OrderItem;

public record OrderItemResponse(
    Long orderItemId,
    Long productId,
    String productName,
    String imageUrl,
    int unitPrice,
    int quantity,
    int itemTotalPrice
) {

    public static OrderItemResponse from(OrderItem orderItem) {

        int unitPrice = orderItem.getProduct().getPrice();
        int quantity = orderItem.getQuantity();

        return new OrderItemResponse(
            orderItem.getId(),
            orderItem.getProduct().getId(),
            orderItem.getProduct().getName(),
            orderItem.getProduct().getImageUrl(),
            unitPrice,
            quantity,
            unitPrice * quantity

        );
    }
}
