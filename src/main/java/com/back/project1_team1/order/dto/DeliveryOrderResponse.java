package com.back.project1_team1.order.dto;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DeliveryOrderResponse {

    private String email;
    private Map<Long, Integer> items;

}
