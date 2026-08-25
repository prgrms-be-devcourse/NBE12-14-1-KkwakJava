package com.back.project1_team1.order;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public void deleteOrder(int orderId){
        Order order = orderRepository.findById(orderId)
            .orElseThrow (() -> new IllegalArgumentException("존재하지 않는 주문입니다,. id = " +orderId));

        orderRepository.delete(order);
    }
}
