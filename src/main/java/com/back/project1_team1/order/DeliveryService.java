package com.back.project1_team1.order;

import com.back.project1_team1.order.dto.DeliveryOrderResponse;
import com.back.project1_team1.order.dto.DeliveryOrderResponse.DeliveryItemResponse;
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

        // 같은 이메일의 주문끼리 그룹화
        Map<String, List<Order>> groupedOrders =
            orders.stream()
                .collect(Collectors.groupingBy(Order::getEmail));

        // 최종 배송 조회 결과를 담을 리스트
        List<DeliveryOrderResponse> responses = new ArrayList<>();

        // 이메일별 주문 그룹을 하나씩 처리
        for (Map.Entry<String, List<Order>> entry : groupedOrders.entrySet()) {

            String email = entry.getKey();
            List<Order> emailOrders = entry.getValue();

            // 같은 이메일의 여러 주문에 포함된 OrderItem을 하나의 리스트로 펼침
            List<OrderItem> orderItems =
                emailOrders.stream()
                    .flatMap(order -> order.getOrderItems().stream())
                    .toList();

            // 같은 상품의 수량을 합산하기 위해 상품 ID 기준으로 그룹화
            Map<Long, List<OrderItem>> groupedItems =
                orderItems.stream()
                    .collect(Collectors.groupingBy(
                        orderItem -> orderItem.getProduct().getId()
                    ));

            // 병합된 상품 정보를 담을 리스트
            List<DeliveryItemResponse> deliveryItems = new ArrayList<>();

            // 상품별로 묶인 OrderItem 처리
            for (List<OrderItem> sameProductItems : groupedItems.values()) {

                // 같은 상품끼리 묶여 있으므로 첫 번째 항목에서 상품 정보 가져오기
                OrderItem firstItem = sameProductItems.get(0);

                // 같은 상품의 주문 수량 모두 합산
                int quantity = sameProductItems.stream()
                    .mapToInt(OrderItem::getQuantity)
                    .sum();

                // 상품 ID, 상품명, 합산 수량을 배송 응답 DTO에 추가
                deliveryItems.add(new DeliveryItemResponse(
                    firstItem.getProduct().getId(),
                    firstItem.getProduct().getName(),
                    quantity
                ));
            }

            // 이메일과 병합된 상품 목록을 최종 응답에 추가
            responses.add(new DeliveryOrderResponse(
                email,
                deliveryItems
            ));
        }

        return responses;
    }
}