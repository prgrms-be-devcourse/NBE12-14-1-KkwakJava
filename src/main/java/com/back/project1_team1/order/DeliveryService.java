package com.back.project1_team1.order;


import com.back.project1_team1.order.dto.DeliveryOrderResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeliveryService {

    // 배송 처리 기준 시간 (오후 2시)
    private static final LocalTime DELIVERY_CUTOFF_TIME = LocalTime.of(14, 0);

    private final OrderRepository orderRepository;

    public List<DeliveryOrderResponse> getDeliveryOrders(LocalDate date) {

        // 조회 날짜(당일)의 14시를 종료 시간으로 설정
        LocalDateTime end = date.atTime(DELIVERY_CUTOFF_TIME);

        // 종료 시간 기준 하루 전(전날) 14시를 시작 시간으로 설정
        LocalDateTime start = end.minusDays(1);

        // 배송 대상 시간대 (start 이상, end 미만)에 생성된 주문 목록 조회
        List<Order> orders =
            orderRepository.findByOrderDateGreaterThanEqualAndOrderDateLessThan(start, end);

        // 주문 목록을 고객 이메일 기준으로 그룹화
        Map<String, List<Order>> groupedOrders =
            orders.stream()
                .collect(Collectors.groupingBy(Order::getEmail));

        List<DeliveryOrderResponse> responses = new ArrayList<>();

        // 이메일별 주문 목록 하나씩 순회
        for (Map.Entry<String, List<Order>> entry : groupedOrders.entrySet()) {

            String email = entry.getKey();
            List<Order> emailOrders = entry.getValue();

            // 이메일에 해당하는 모든 주문 상품 목록을 하나로 나열
            List<OrderItem> orderItems =
                emailOrders.stream()
                    .flatMap(order -> order.getOrderItems().stream())
                    .toList();

            // 상품 ID를 key로 같은 상품 수량 확인 후 합산
            Map<Long, Integer> productQuantities =
                orderItems.stream()
                    .collect(Collectors.toMap(
                        orderItem -> orderItem.getProduct().getId(),
                        OrderItem::getQuantity,
                        Integer::sum
                    ));

            // 이메일과 상품별 합산 수량을 응답 목록에 추가
            responses.add(new DeliveryOrderResponse(
                email,
                productQuantities
            ));
        }

        // 병합된 주문 응답 목록 반환
        return responses;
    }

    // 고객 이메일에 해당하는 배송 주문 조회
    public List<DeliveryOrderResponse> getDeliveryOrdersByEmail(
        LocalDate date,
        String email
    ) {
        return getDeliveryOrders(date)
            .stream()
            .filter(response -> response.getEmail().equals(email))
            .toList();
    }
}
