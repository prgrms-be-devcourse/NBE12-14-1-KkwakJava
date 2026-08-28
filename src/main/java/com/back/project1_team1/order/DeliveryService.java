package com.back.project1_team1.order;

import com.back.project1_team1.order.dto.DeliveryOrderResponse;
import com.back.project1_team1.order.dto.DeliveryOrderResponse.DeliveryItemResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
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

    // [관리자 배송 조회]
    // 모든 주문을 배송 기준일 + 이메일 기준으로 병합
    public List<DeliveryOrderResponse> getDeliveryOrders() {

        // DB의 모든 주문 조회
        List<Order> orders = orderRepository.findAll();

        // 주문을 배송 기준일별로 나누기
        Map<LocalDate, List<Order>> ordersByDeliveryDate = orders.stream()
            .collect(Collectors.groupingBy(order -> {
                LocalDateTime orderDate = order.getOrderDate();

                // 오후 2시 이전 주문 → 해당 날짜 배송 묶음
                if (orderDate.toLocalTime().isBefore(DELIVERY_CUTOFF_TIME)) {
                    return orderDate.toLocalDate();
                }

                // 오후 2시 이후 주문 → 다음날 배송 묶음
                return orderDate.toLocalDate().plusDays(1);
            }));

        List<DeliveryOrderResponse> responses = new ArrayList<>();

        // 배송일별로 이메일 주문 병합
        for (Map.Entry<LocalDate, List<Order>> entry : ordersByDeliveryDate.entrySet()) {
            LocalDate deliveryDate = entry.getKey();

            // 해당 배송 묶음의 마감 시간
            LocalDateTime end = deliveryDate.atTime(DELIVERY_CUTOFF_TIME);

            responses.addAll(mergeOrders(entry.getValue(), end));
        }

        // 가장 최근 주문일 순으로 정렬
        responses.sort(
            Comparator.comparing(DeliveryOrderResponse::getOrderDate).reversed()
        );

        return responses;
    }

    // 같은 배송일의 주문을 이메일 기준으로 병합
    private List<DeliveryOrderResponse> mergeOrders(
        List<Order> orders,
        LocalDateTime end
    ) {

        // 배송 기준 시간인 14시가 지났으면 배송 완료
        boolean deliveryCompleted = !LocalDateTime.now().isBefore(end);

        // 주문을 최신순 정렬 후 같은 이메일끼리 묶기
        Map<String, List<Order>> groupedOrders = orders.stream()
            .sorted(Comparator.comparing(Order::getOrderDate).reversed())
            .collect(Collectors.groupingBy(
                Order::getEmail,
                LinkedHashMap::new,
                Collectors.toList()
            ));

        List<DeliveryOrderResponse> responses = new ArrayList<>();

        // 이메일별 주문 처리
        for (Map.Entry<String, List<Order>> entry : groupedOrders.entrySet()) {
            String email = entry.getKey();
            List<Order> emailOrders = entry.getValue();

            // 최신 주문
            Order firstOrder = emailOrders.get(0);
            String postalCode = firstOrder.getPostalCode();
            String address = firstOrder.getAddress();

            // 같은 이메일 주문에 들어있는 모든 주문상품 펼치기
            List<OrderItem> orderItems = emailOrders.stream()
                .flatMap(order -> order.getOrderItems().stream())
                .toList();

            // 같은 상품 ID끼리 묶기
            Map<Long, List<OrderItem>> groupedItems = orderItems.stream()
                .collect(Collectors.groupingBy(
                    orderItem -> orderItem.getProduct().getId()
                ));

            List<DeliveryItemResponse> deliveryItems = new ArrayList<>();

            // 같은 상품 수량 합산
            for (List<OrderItem> sameProductItems : groupedItems.values()) {
                OrderItem firstItem = sameProductItems.get(0);

                int quantity = sameProductItems.stream()
                    .mapToInt(OrderItem::getQuantity)
                    .sum();

                int unitPrice = firstItem.getProduct().getPrice();
                int itemTotalPrice = unitPrice * quantity;

                deliveryItems.add(new DeliveryItemResponse(
                    firstItem.getProduct().getId(),
                    firstItem.getProduct().getName(),
                    firstItem.getProduct().getImageUrl(),
                    unitPrice,
                    quantity,
                    itemTotalPrice
                ));
            }

            // 병합된 배송 전체 금액
            int totalAmount = deliveryItems.stream()
                .mapToInt(DeliveryItemResponse::itemTotalPrice)
                .sum();

            responses.add(new DeliveryOrderResponse(
                firstOrder.getId(),
                email,
                postalCode,
                address,
                firstOrder.getOrderDate(),
                deliveryCompleted,
                totalAmount,
                deliveryItems
            ));
        }

        // 병합된 주문 응답 목록 반환
        return responses;
    }
}
