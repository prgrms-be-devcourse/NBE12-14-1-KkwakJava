package com.back.project1_team1.order;

import com.back.project1_team1.order.dto.DeliveryOrderResponse;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping("/merged")
    public List<DeliveryOrderResponse> getDeliveryOrders(
        @RequestParam
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate date,
        @RequestParam(required = false) String email) {

        // 배송 대상 주문 조회: 이메일이 있으면 해당 이메일만, 없으면 전체 조회
        if (email != null) {

            // 이메일 파라미터가 전달됐지만 값이 비어 있는 경우
            if (email.isBlank()) {
                throw new IllegalArgumentException("이메일을 입력해주세요.");
            }

            // 해당 이메일의 배송 대상 주문 조회
            return deliveryService.getDeliveryOrdersByEmail(date, email);
        }

        // 전체 배송 대상 주문 조회
        return deliveryService.getDeliveryOrders(date);
    }
}
