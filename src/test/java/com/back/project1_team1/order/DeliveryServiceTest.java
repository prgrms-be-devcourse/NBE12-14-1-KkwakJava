package com.back.project1_team1.order;

import static org.assertj.core.api.Assertions.assertThat;

import com.back.project1_team1.order.dto.DeliveryOrderResponse;
import com.back.project1_team1.order.entity.Order;
import com.back.project1_team1.order.repository.OrderRepository;
import com.back.project1_team1.order.service.DeliveryService;
import com.back.project1_team1.product.entity.Product;
import com.back.project1_team1.product.repository.ProductRepository;
import java.time.LocalDateTime;
import java.util.List;
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
    @DisplayName("같은 배송일의 같은 이메일 주문은 하나로 병합된다")
    void mergeSameEmail() {

        Product product1 = productRepository.save(
            new Product("TEST_BEAN_1", 10000, null)
        );

        Product product2 = productRepository.save(
            new Product("TEST_BEAN_2", 12000, null)
        );

        Order order1 = new Order(
            "merge@test.com",
            "12345",
            "서울시 강남구 테스트로 1",
            LocalDateTime.of(2026, 8, 25, 15, 0)
        );
        order1.addOrderItem(product1, 2);

        Order order2 = new Order(
            "merge@test.com",
            "12345",
            "서울시 강남구 테스트로 2",
            LocalDateTime.of(2026, 8, 25, 16, 0)
        );
        order2.addOrderItem(product2, 3);

        orderRepository.save(order1);
        orderRepository.save(order2);

        List<DeliveryOrderResponse> result =
            deliveryService.getDeliveryOrders();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail())
            .isEqualTo("merge@test.com");
    }

    @Test
    @DisplayName("같은 상품의 주문 수량은 합산된다")
    void sumSameProductQuantity() {

        Product product = productRepository.save(
            new Product("TEST_BEAN", 10000, null)
        );

        Order order1 = new Order(
            "merge@test.com",
            "12345",
            "서울시 강남구 테스트로 1",
            LocalDateTime.of(2026, 8, 25, 15, 0)
        );
        order1.addOrderItem(product, 2);

        Order order2 = new Order(
            "merge@test.com",
            "12345",
            "서울시 강남구 테스트로 1",
            LocalDateTime.of(2026, 8, 25, 16, 0)
        );
        order2.addOrderItem(product, 3);

        orderRepository.save(order1);
        orderRepository.save(order2);

        List<DeliveryOrderResponse> result =
            deliveryService.getDeliveryOrders();

        DeliveryOrderResponse response = result.get(0);

        assertThat(response.getItems()).hasSize(1);

        DeliveryOrderResponse.DeliveryItemResponse item =
            response.getItems().get(0);

        assertThat(item.productId())
            .isEqualTo(product.getId());

        assertThat(item.productName())
            .isEqualTo("TEST_BEAN");

        assertThat(item.quantity())
            .isEqualTo(5);
    }

    @Test
    @DisplayName("14시를 기준으로 배송 묶음이 나뉜다")
    void groupOrdersByDeliveryTime() {

        Product product = productRepository.save(
            new Product("TEST_BEAN", 10000, null)
        );

        // 14시 이전 → 8월 25일 배송 묶음
        Order beforeCutoff = new Order(
            "time@test.com",
            "12345",
            "서울시 강남구 테스트로 1",
            LocalDateTime.of(2026, 8, 25, 13, 59)
        );
        beforeCutoff.addOrderItem(product, 1);

        // 14시부터 → 8월 26일 배송 묶음
        Order atCutoff = new Order(
            "time@test.com",
            "12345",
            "서울시 강남구 테스트로 1",
            LocalDateTime.of(2026, 8, 25, 14, 0)
        );
        atCutoff.addOrderItem(product, 2);

        // 다음날 14시 이전 → 같은 8월 26일 배송 묶음
        Order beforeNextCutoff = new Order(
            "time@test.com",
            "12345",
            "서울시 강남구 테스트로 1",
            LocalDateTime.of(2026, 8, 26, 13, 59)
        );
        beforeNextCutoff.addOrderItem(product, 3);

        orderRepository.save(beforeCutoff);
        orderRepository.save(atCutoff);
        orderRepository.save(beforeNextCutoff);

        List<DeliveryOrderResponse> result =
            deliveryService.getDeliveryOrders();

        // 8/25 배송 묶음, 8/26 배송 묶음 → 총 2개
        assertThat(result).hasSize(2);

        // 8/25 묶음 = 1개
        // 8/26 묶음 = 2 + 3 = 5개
        assertThat(result)
            .extracting(
                response ->
                    response.getItems().get(0).quantity()
            )
            .containsExactlyInAnyOrder(1, 5);
    }
}