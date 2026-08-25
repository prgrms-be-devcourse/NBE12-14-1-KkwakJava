package com.back.project1_team1.order;


import com.back.project1_team1.order.dto.DeliveryOrderResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final OrderRepository orderRepository;

    public List<DeliveryOrderResponse> getDeliveryOrders(LocalDate date) {

        // 조회 날짜(당일)의 14시를 종료 시간으로 설정
        LocalDateTime end = date.atTime(14, 0);

        // 종료 시간 기준 하루 전(전날) 14시를 시작 시간으로 설정
        LocalDateTime start = end.minusDays(1);

        // 배송 대상 시간대 (start 이상, end 미만)에 생성된 주문 목록 조회
        List<Order> orders =
            orderRepository.findByOrderDateGreaterThanEqualAndOrderDateLessThan(start, end);

        //조회한 Order Entity를 응답용 DTO로 변환
        return orders.stream()
            .map(order -> new DeliveryOrderResponse(
                order.getId(),
                order.getEmail(),
                order.getOrderDate()
            ))
            .toList();
    }
}
