package com.back.project1_team1;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.back.project1_team1.global.ResourceNotFoundException;
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
            new Product("Columnbia Narino", 5000, null)
        );

        product2 = productRepository.save(
            new Product("Ethiopia Sidamo", 7000, null)
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
        assertThat(savedOrder.getPostalCode()).isEqualTo("12345");
        assertThat(savedOrder.getAddress()).isEqualTo("서울시 강남구 테스트로 1");
        assertThat(savedOrder.getOrderDate()).isNotNull();
    }

    @Test
    @DisplayName("존재하지 않는 상품 ID로 주문 생성 시 예외가 발생하고 주문은 저장되지 않는다")
    void createOrder_invalidProduct_rollback() {

        // given
        long beforeOrderCount = orderRepository.count();
        long beforeOrderItemCount = orderItemRepository.count();

        OrderCreateRequest request = new OrderCreateRequest(
            "invalid@test.com",
            "12345",
            "서울시 테스트구 테스트로 100",
            List.of(
                new OrderItemRequest(product1.getId(), 2),
                new OrderItemRequest(999999L, 1)
            )
        );

        // when & then
        assertThatThrownBy(() -> orderService.createOrder(request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("존재하지 않는 상품입니다");

        // 주문과 주문상품이 추가되지 않았는지 확인
        assertThat(orderRepository.count()).isEqualTo(beforeOrderCount);
        assertThat(orderItemRepository.count()).isEqualTo(beforeOrderItemCount);
    }

    @Test
    @DisplayName("동일한 상품을 중복하여 주문하면 예외가 발생한다")
    void createOrder_duplicateProduct_fail() {

        OrderCreateRequest request = new OrderCreateRequest(
            "test@test.com",
            "12345",
            "서울시 강남구 테스트로 1",
            List.of(
                new OrderItemRequest(product1.getId(), 2),
                new OrderItemRequest(product1.getId(), 3)
            )
        );

        assertThatThrownBy(() -> orderService.createOrder(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("동일한 상품을 중복하여 주문할 수 없습니다.");
    }
}
