//package com.back.project1_team1;
//
//import com.back.project1_team1.order.Order;
//import com.back.project1_team1.order.OrderRepository;
//import com.back.project1_team1.order.OrderService;
//
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.assertj.core.api.Assertions.assertThatThrownBy;
//
//@SpringBootTest
//class DeleteTest {
//
//    @Autowired
//    private OrderService orderService;
//
//    @Autowired
//    private OrderRepository orderRepository;
//
//    private Order savedOrder;
//
//    @BeforeEach
//    void setUp() {
//        Order order = new Order();
//        order.setEmail("test@test.com");
//        order.setOrderDate(LocalDateTime.now());
//
//        savedOrder = orderRepository.save(order);
//    }
//
//    @Test
//    @DisplayName("존재하는 주문을 삭제하면 DB에서 사라진다")
//    @Transactional
//    void deleteOrder_success() {
//        int orderId = savedOrder.getId();
//
//        orderService.deleteOrder(orderId);
//
//        assertThat(orderRepository.findById(orderId)).isEmpty();
//    }
//
//    @Test
//    @DisplayName("존재하지 않는 id로 삭제 시도하면 예외가 발생한다")
//    void deleteOrder_notFound_throwsException() {
//        int notExistId = 999999;
//
//        assertThatThrownBy(() -> orderService.deleteOrder(notExistId))
//            .isInstanceOf(IllegalArgumentException.class)
//            .hasMessageContaining("존재하지 않는 주문입니다");
//    }
//}