package com.back.project1_team1;

import static org.assertj.core.api.Assertions.assertThat;

import com.back.project1_team1.order.Order;
import com.back.project1_team1.order.OrderItem;
import com.back.project1_team1.order.OrderItemRepository;
import com.back.project1_team1.order.OrderRepository;
import com.back.project1_team1.order.OrderService;
import com.back.project1_team1.order.dto.OrderCreateRequest;
import com.back.project1_team1.order.dto.OrderItemRequest;
import com.back.project1_team1.product.Product;
import com.back.project1_team1.product.ProductRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class OrderCreateTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    private Product product1;
    private Product product2;

    @BeforeEach
    void setUp(){

        product1 = productRepository.save(
            new Product("Columnbia Narino", 5000)
        );

        product2 = productRepository.save(
            new Product("Ethiopia Sidamo", 7000)
        );
    }

    @Test
    @DisplayName("주문을 생성하면 Order와 OrderItem이 저장된다")
    void createOrder_success(){

        OrderCreateRequest request = new OrderCreateRequest(
            "test@test.com",
            "12345",
            "서울시 강남구 테스트로 1",
            List.of(
                new OrderItemRequest(product1.getId(), 2),
                new OrderItemRequest(product2.getId(), 1)
            )
        );

        orderService.createOrder(request);

        List<Order> orders = orderRepository.findAll();
        List<OrderItem> orderItems = orderItemRepository.findAll();

        assertThat(orders).hasSize(1);
        assertThat(orderItems).hasSize(2);

        Order savedOrder = orders.get(0);

        assertThat(savedOrder.getEmail()).isEqualTo("test@test.com");
        assertThat(savedOrder.getOrderDate()).isNotNull();
    }
}
