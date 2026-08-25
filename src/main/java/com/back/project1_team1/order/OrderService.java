package com.back.project1_team1.order;

import com.back.project1_team1.order.dto.OrderResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public List<OrderResponse> findAll() {
        List<Order> orders = this.orderRepository.findAll();

        List<OrderResponse> orderResponse = orders
            .stream()
            .map(OrderResponse::from)
            .toList();

        return orderResponse;

    }

    public List<OrderResponse> findByEmail(String email) {
        List<Order> orders = this.orderRepository.findByEmail(email);

        List<OrderResponse> orderResponses = orders
            .stream()
            .map(OrderResponse::from)
            .toList();
        return orderResponses;
    }


}
