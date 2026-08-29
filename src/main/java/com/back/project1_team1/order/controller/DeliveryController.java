package com.back.project1_team1.order.controller;

import com.back.project1_team1.order.service.DeliveryService;
import com.back.project1_team1.order.dto.DeliveryOrderResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    // [관리자 배송 조회]
    // 전체 주문을 배송일과 이메일 기준으로 병합하여 조회
    @GetMapping("/merged")
    public List<DeliveryOrderResponse> getDeliveryOrders() {

        return deliveryService.getDeliveryOrders();
    }
}