package com.back.project1_team1.order.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DeliveryOrderResponse {

    private String email;
    private List<DeliveryItemResponse> items;

    public record DeliveryItemResponse(
        Long productId,
        String productName,
        int quantity
    ){
    }

}
