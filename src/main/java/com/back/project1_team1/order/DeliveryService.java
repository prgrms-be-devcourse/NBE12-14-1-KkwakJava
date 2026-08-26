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

    // [관리자 배송조회] 14시 기준 배송 대상 주문을 이메일별로 병합하여 전체 조회
    public List<DeliveryOrderResponse> getDeliveryOrders(LocalDate date) {

        LocalDateTime end = date.atTime(DELIVERY_CUTOFF_TIME);
        LocalDateTime start = end.minusDays(1);

        // 배송 대상 시간 범위의 주문 조회
        List<Order> orders =
            orderRepository.findByOrderDateGreaterThanEqualAndOrderDateLessThan(start, end);

        return mergeOrders(orders);
    }

    // [이메일 검색] 해당 이메일의 14시 기준 배송 대상 주문 조회
    public List<DeliveryOrderResponse> getDeliveryOrdersByEmail(
        LocalDate date,
        String email
    ) {
        LocalDateTime end = date.atTime(DELIVERY_CUTOFF_TIME);
        LocalDateTime start = end.minusDays(1);

        // 이메일 + 배송 대상 시간 범위의 주문 조회
        List<Order> orders =
            orderRepository.findByEmailAndOrderDateGreaterThanEqualAndOrderDateLessThan(
                email,
                start,
                end
            );

        return mergeOrders(orders);
    }

    // 주문 목록을 이메일 기준으로 병합
    private List<DeliveryOrderResponse> mergeOrders(List<Order> orders) {

        Map<String, List<Order>> groupedOrders =
            orders.stream()
                .collect(Collectors.groupingBy(Order::getEmail));

        List<DeliveryOrderResponse> responses = new ArrayList<>();

        for (Map.Entry<String, List<Order>> entry : groupedOrders.entrySet()) {

            String email = entry.getKey();
            List<Order> emailOrders = entry.getValue();

            // 여러 주문의 OrderItem을 하나의 리스트로 펼침
            List<OrderItem> orderItems =
                emailOrders.stream()
                    .flatMap(order -> order.getOrderItems().stream())
                    .toList();

            // 상품 ID를 Key로 사용하고 같은 상품의 수량 합산
            Map<Long, Integer> productQuantities =
                orderItems.stream()
                    .collect(Collectors.toMap(
                        orderItem -> orderItem.getProduct().getId(),
                        OrderItem::getQuantity,
                        Integer::sum
                    ));

            responses.add(new DeliveryOrderResponse(
                email,
                productQuantities
            ));
        }

        return responses;
    }
}