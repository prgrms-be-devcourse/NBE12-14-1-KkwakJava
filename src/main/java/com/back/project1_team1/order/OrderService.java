package com.back.project1_team1.order;

import com.back.project1_team1.order.dto.OrderCreateRequest;
import com.back.project1_team1.order.dto.OrderItemRequest;
import com.back.project1_team1.order.dto.OrderResponse;
import com.back.project1_team1.product.Product;
import com.back.project1_team1.product.ProductRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    // private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    // 전체 주문 목록 조회
    public List<OrderResponse> findAll() {
        List<Order> orders = this.orderRepository.findAll();

        List<OrderResponse> orderResponse = orders
            .stream()
            .map(OrderResponse::from)
            .toList();

        return orderResponse;
    }

    // 이메일 조건 주문 목록 조회
    public List<OrderResponse> findByEmail(String email) {
        List<Order> orders = this.orderRepository.findByEmail(email);

        List<OrderResponse> orderResponses = orders
            .stream()
            .map(OrderResponse::from)
            .toList();

        return orderResponses;
    }

    // 주문 생성
    @Transactional // 주문 생성 전체를 한 작업 단위로 묶기
    public void createOrder(OrderCreateRequest request) {

        // 요청 DTO의 고객 정보와 현재 서버 시각으로 주문 생성
        Order order = new Order(
            request.email(),
            request.postalCode(),
            request.address(),
            LocalDateTime.now()
        );

        // 요청에 포함된 주문 상품 목록 순회
        for (OrderItemRequest itemRequest : request.items()) {

            // productId에 해당하는 상품 조회
            Product product = productRepository
                .findById(itemRequest.productId())
                .orElseThrow(() ->
                    new IllegalArgumentException(
                        "존재하지 않는 상품입니다. id = " + itemRequest.productId()
                    )
                );

            // OrderItem 생성 + Order와 연관관계 연결
            order.addOrderItem(
                product,
                itemRequest.quantity()
            );
        }

        // Order 저장 시 CascadeType.PERSIST에 의해 OrderItem도 함께 저장
        orderRepository.save(order);
    }

    // 주문 삭제
    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "존재하지 않는 주문입니다. id = " + orderId
                )
            );

        orderRepository.delete(order);
    }
}