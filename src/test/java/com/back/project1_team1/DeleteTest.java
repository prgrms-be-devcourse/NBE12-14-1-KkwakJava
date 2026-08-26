package com.back.project1_team1;

import com.back.project1_team1.order.Order;
import com.back.project1_team1.order.OrderRepository;
import com.back.project1_team1.order.OrderService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DeleteTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    private Order savedOrder;

    @BeforeEach
    void setUp() {
        Order order = new Order(
            "test@test.com",
            "12345",
            "서울시 강남구 테스트로 1",
            LocalDateTime.now()
        );

        savedOrder = orderRepository.save(order);
    }

    @Test
    @DisplayName("존재하는 주문을 삭제하면 DB에서 사라진다")
    void deleteOrder_success() {
        Long orderId = savedOrder.getId();

        orderService.deleteOrder(orderId);

        assertThat(orderRepository.findById(orderId)).isEmpty();
    }

    @Test
    @DisplayName("존재하지 않는 id로 삭제 시도하면 예외가 발생한다")
    void deleteOrder_notFound_throwsException() {
        Long notExistId = 999999L;

        assertThatThrownBy(() -> orderService.deleteOrder(notExistId))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("존재하지 않는 주문입니다");
    }

    @Test
    @DisplayName("배송 마감 시간이 지난 주문은 삭제할 수 없다")
    void deleteOrder_alreadyDelivered_throwsException() {
        Order deliveredOrder = orderRepository.save(new Order(
            "test@test.com",
            "12345",
            "서울시 강남구 테스트로 1",
            LocalDateTime.now().minusDays(2)
        ));

        assertThatThrownBy(() -> orderService.deleteOrder(deliveredOrder.getId()))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("이미 배송된 주문이라 삭제할 수 없습니다");
    }

    @Test
    @DisplayName("다건 삭제 시 배송 마감 시간이 지난 주문이 포함되어 있으면 전체가 삭제되지 않는다")
    void deleteOrders_alreadyDelivered_throwsException() {
        Order deliveredOrder = orderRepository.save(new Order(
            "test@test.com",
            "12345",
            "서울시 강남구 테스트로 1",
            LocalDateTime.now().minusDays(2)
        ));

        assertThatThrownBy(() ->
            orderService.deleteOrders(List.of(savedOrder.getId(), deliveredOrder.getId())))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("이미 배송된 주문이라 삭제할 수 없습니다");

        assertThat(orderRepository.findById(savedOrder.getId())).isPresent();
        assertThat(orderRepository.findById(deliveredOrder.getId())).isPresent();
    }
}
