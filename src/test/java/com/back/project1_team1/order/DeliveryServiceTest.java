package com.back.project1_team1.order;

import static org.assertj.core.api.Assertions.assertThat;

import com.back.project1_team1.order.dto.DeliveryOrderResponse;
import com.back.project1_team1.product.Product;
import com.back.project1_team1.product.ProductRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
class DeliveryServiceTest {

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Test
    @DisplayName("같은 이메일의 주문은 하나로 병합된다")
    void mergeSameEmail() {

        // 테스트용 상품 2개 생성
        Product product1 = productRepository.save(
            new Product("TEST_BEAN_1", 10000)
        );

        Product product2 = productRepository.save(
            new Product("TEST_BEAN_2", 12000)
        );

        // 같은 이메일로 서로 다른 주문 2건 생성
        Order order1 = new Order(
            "merge@test.com",
            "12345",
            "서울시 테스트 주소",
            LocalDateTime.of(2026, 8, 25, 15, 0)
        );
        order1.addOrderItem(product1, 2);

        Order order2 = new Order(
            "merge@test.com",
            "12345",
            "서울시 테스트 주소",
            LocalDateTime.of(2026, 8, 25, 16, 0)
        );
        order2.addOrderItem(product2, 3);

        // 주문 저장
        orderRepository.save(order1);
        orderRepository.save(order2);

        // 8월 26일 배송 대상 주문 조회
        List<DeliveryOrderResponse> result =
            deliveryService.getDeliveryOrders(LocalDate.of(2026, 8, 26));

        // 같은 이메일의 주문이 하나로 병합되었는지 확인
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo("merge@test.com");
    }

    @Test
    @DisplayName("같은 상품의 주문 수량은 합산된다")
    void sumSameProductQuantity() {

        // 테스트용 상품 생성
        Product product = productRepository.save(
            new Product("TEST_BEAN", 10000)
        );

        // 같은 이메일로 같은 상품을 각각 2개, 3개 주문
        Order order1 = new Order(
            "merge@test.com",
            "12345",
            "서울시 테스트 주소",
            LocalDateTime.of(2026, 8, 25, 15, 0)
        );
        order1.addOrderItem(product, 2);

        Order order2 = new Order(
            "merge@test.com",
            "12345",
            "서울시 테스트 주소",
            LocalDateTime.of(2026, 8, 25, 16, 0)
        );
        order2.addOrderItem(product, 3);

        // 주문 저장
        orderRepository.save(order1);
        orderRepository.save(order2);

        // 8월 26일 배송 대상 주문 조회
        List<DeliveryOrderResponse> result =
            deliveryService.getDeliveryOrders(LocalDate.of(2026, 8, 26));

        DeliveryOrderResponse response = result.get(0);

        // 같은 상품의 수량이 2 + 3 = 5로 합산되었는지 확인
        assertThat(response.getItems())
            .isEqualTo(Map.of(product.getId(), 5));
    }

    @Test
    @DisplayName("전날 14시부터 당일 14시 이전 주문만 조회된다")
    void findOrdersByDeliveryTime() {

        // 테스트용 상품 생성
        Product product = productRepository.save(
            new Product("TEST_BEAN", 10000)
        );

        // 시작 시간 이전 주문 - 조회 대상 제외
        Order beforeStart = new Order(
            "before@test.com",
            "12345",
            "서울시 테스트 주소",
            LocalDateTime.of(2026, 8, 25, 13, 59)
        );
        beforeStart.addOrderItem(product, 1);

        // 시작 시간과 동일한 주문 - 조회 대상 포함
        Order start = new Order(
            "start@test.com",
            "12345",
            "서울시 테스트 주소",
            LocalDateTime.of(2026, 8, 25, 14, 0)
        );
        start.addOrderItem(product, 1);

        // 종료 시간 직전 주문 - 조회 대상 포함
        Order beforeEnd = new Order(
            "beforeEnd@test.com",
            "12345",
            "서울시 테스트 주소",
            LocalDateTime.of(2026, 8, 26, 13, 59)
        );
        beforeEnd.addOrderItem(product, 1);

        // 종료 시간과 동일한 주문 - 조회 대상 제외
        Order end = new Order(
            "end@test.com",
            "12345",
            "서울시 테스트 주소",
            LocalDateTime.of(2026, 8, 26, 14, 0)
        );
        end.addOrderItem(product, 1);

        // 주문 저장
        orderRepository.save(beforeStart);
        orderRepository.save(start);
        orderRepository.save(beforeEnd);
        orderRepository.save(end);

        // 8월 26일 배송 대상 주문 조회
        List<DeliveryOrderResponse> result =
            deliveryService.getDeliveryOrders(LocalDate.of(2026, 8, 26));

        // 8월 25일 14시 이상, 8월 26일 14시 미만 주문만 조회되는지 확인
        assertThat(result).hasSize(2);

        assertThat(result)
            .extracting(DeliveryOrderResponse::getEmail)
            .containsExactlyInAnyOrder(
                "start@test.com",
                "beforeEnd@test.com"
            );
    }

    @Test
    @DisplayName("이메일로 조회하면 해당 고객의 배송 주문만 반환된다")
    void findDeliveryOrdersByEmail() {

        // 테스트용 상품 생성
        Product product = productRepository.save(
            new Product("TEST_BEAN", 10000)
        );

        // 서로 다른 이메일의 주문 생성
        Order order1 = new Order(
            "customer1@test.com",
            "12345",
            "서울시 테스트 주소",
            LocalDateTime.of(2026, 8, 25, 15, 0)
        );
        order1.addOrderItem(product, 2);

        Order order2 = new Order(
            "customer2@test.com",
            "12345",
            "서울시 테스트 주소",
            LocalDateTime.of(2026, 8, 25, 16, 0)
        );
        order2.addOrderItem(product, 3);

        // 주문 저장
        orderRepository.save(order1);
        orderRepository.save(order2);

        // customer1 이메일로 배송 주문 조회
        List<DeliveryOrderResponse> result =
            deliveryService.getDeliveryOrdersByEmail(
                LocalDate.of(2026, 8, 26),
                "customer1@test.com"
            );

        // 해당 이메일의 배송 주문만 조회되는지 확인
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail())
            .isEqualTo("customer1@test.com");
    }
}