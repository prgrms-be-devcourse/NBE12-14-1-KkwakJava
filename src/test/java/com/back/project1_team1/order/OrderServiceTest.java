package com.back.project1_team1.order;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.back.project1_team1.global.ResourceNotFoundException;
import com.back.project1_team1.order.dto.OrderCreateRequest;
import com.back.project1_team1.order.dto.OrderItemRequest;
import com.back.project1_team1.order.dto.OrderResponse;
import com.back.project1_team1.order.dto.OrderUpdateRequest;
import com.back.project1_team1.order.entity.Order;
import com.back.project1_team1.order.entity.OrderItem;
import com.back.project1_team1.order.repository.OrderItemRepository;
import com.back.project1_team1.order.repository.OrderRepository;
import com.back.project1_team1.order.service.OrderService;
import com.back.project1_team1.product.entity.Product;
import com.back.project1_team1.product.repository.ProductRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
class OrderServiceTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void setUp() {
        // 1. 테스트용 상품 4개 저장
        Product p1 = productRepository.save(new Product("에티오피아 예가체프", 6000, null));
        Product p2 = productRepository.save(new Product("콜롬비아 수프레모", 5000, null));
        Product p3 = productRepository.save(new Product("과테말라 안티구아", 5500, null));
        Product p4 = productRepository.save(new Product("브라질 세라도", 4500, null));

        // 2. 10개의 주문자 이메일 목록
        String[] emails = {
            "test1@test.com", "test1@test.com",
            "test2@test.com", "test2@test.com", "test2@test.com",
            "coffee.lover@test.com", "dev.kim@test.com",
            "guest1@test.com", "guest2@test.com", "admin@test.com"
        };

        // 3. 10개의 주문 데이터 생성 및 저장 (주문당 상품 2종류 포함)
        for (int i = 0; i < 10; i++) {
            Order order = new Order(
                emails[i],
                "12345",
                "서울시 강남구 테스트로 " + (i + 1),
                LocalDateTime.now().minusDays(10 - i));

            // 상품 추가 (Cascade로 인해 OrderItem도 자동 persist 됨)
            order.addOrderItem((i % 2 == 0) ? p1 : p3, (i % 3) + 1);
            order.addOrderItem((i % 2 == 0) ? p2 : p4, (i % 2) + 1);

            orderRepository.save(order);
        }
    }

    // ---------- 주문 생성 ----------
    @Test
    @DisplayName("주문을 생성하면 Order와 OrderItem이 저장된다")
    void createOrder_success(){

        // given
        List<Product> products = productRepository.findAll();

        Product product1 = products.get(0);
        Product product2 = products.get(1);

        long beforeOrderCount = orderRepository.count();
        long beforeOrderItemCount = orderItemRepository.count();

        OrderCreateRequest request = new OrderCreateRequest(
            "test@test.com",
            "12345",
            "서울시 강남구 테스트로 1",
            List.of(
                new OrderItemRequest(product1.getId(), 2),
                new OrderItemRequest(product2.getId(), 1)
            )
        );

        // when
        OrderResponse response = orderService.createOrder(request);

        // then
        assertThat(orderRepository.count()).isEqualTo(beforeOrderCount + 1);
        assertThat(orderItemRepository.count()).isEqualTo(beforeOrderItemCount + 2);

        assertThat(response.email()).isEqualTo("test@test.com");
        assertThat(response.postalCode()).isEqualTo("12345");
        assertThat(response.address()).isEqualTo("서울시 강남구 테스트로 1");
        assertThat(response.items()).hasSize(2);
    }

    @Test
    @DisplayName("존재하지 않는 상품 ID로 주문 생성 시 예외가 발생하고 주문은 저장되지 않는다")
    void createOrder_invalidProduct_rollback() {

        // given
        Product product = productRepository.findAll().get(0);

        long beforeOrderCount = orderRepository.count();
        long beforeOrderItemCount = orderItemRepository.count();

        OrderCreateRequest request = new OrderCreateRequest(
            "invalid@test.com",
            "12345",
            "서울시 테스트구 테스트로 100",
            List.of(
                new OrderItemRequest(product.getId(), 2),
                new OrderItemRequest(999999L, 1)
            )
        );

        // when & then
        assertThatThrownBy(() -> orderService.createOrder(request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("존재하지 않는 상품입니다");

        assertThat(orderRepository.count()).isEqualTo(beforeOrderCount);
        assertThat(orderItemRepository.count()).isEqualTo(beforeOrderItemCount);
    }

    @Test
    @DisplayName("동일한 상품을 중복하여 주문하면 예외가 발생한다")
    void createOrder_duplicateProduct_fail() {

        // given
        Product product = productRepository.findAll().get(0);

        OrderCreateRequest request = new OrderCreateRequest(
            "test@test.com",
            "12345",
            "서울시 강남구 테스트로 1",
            List.of(
                new OrderItemRequest(product.getId(), 2),
                new OrderItemRequest(product.getId(), 3)
            )
        );

        // when & then
        assertThatThrownBy(() -> orderService.createOrder(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("동일한 상품을 중복하여 주문할 수 없습니다.");
    }

    // ---------- 주문 조회 ----------
    @Test
    @DisplayName("전체 주문 다건 조회: 10건의 주문이 DTO로 정상 반환되며 품목과 총액이 계산된다")
    void findAllOrdersTest() {

        // when
        List<OrderResponse> responses = orderService.findAll();

        // then
        assertThat(responses).hasSize(10);

        assertThat(responses)
            .allSatisfy(response -> {
                assertThat(response.orderId()).isNotNull();
                assertThat(response.email()).isNotNull();
                assertThat(response.items()).hasSize(2);
                assertThat(response.totalAmount()).isGreaterThan(0);
            });
    }

    @Test
    @DisplayName("이메일 조건 검색: test1@test.com 조회 시 2건만 반환된다")
    void findByEmailTest1() {
        // given
        String email = "test1@test.com";

        // when
        List<OrderResponse> responses = orderService.findByEmail(email);

        // then
        assertThat(responses).hasSize(2);
        assertThat(responses).allMatch(res -> res.email().equals(email));
    }

    @Test
    @DisplayName("이메일 조건 검색: test2@test.com 조회 시 3건만 반환된다")
    void findByEmailTest2() {
        // given
        String email = "test2@test.com";

        // when
        List<OrderResponse> responses = orderService.findByEmail(email);

        // then
        assertThat(responses).hasSize(3);
        assertThat(responses).allMatch(res -> res.email().equals(email));
    }

    // ---------- 주문 수정 ----------
    @Test
    @DisplayName("주문 수정: 배송 마감 전이면 배송지와 상품 목록(수량)이 정상 수정된다")
    void modifyOrder_success() {
        // given
        Product product = productRepository.save(new Product("새로운 원두", 8000, null));

        Order order = new Order("modify@test.com", "12345", "기존 주소", LocalDateTime.now());
        order.addOrderItem(product, 1);
        Order savedOrder = orderRepository.save(order);

        OrderUpdateRequest updateRequest = new OrderUpdateRequest(
            "54321",
            "수정된 주소",
            List.of(new OrderItemRequest(product.getId(), 5))
        );

        // when
        OrderResponse response = orderService.modifyOrder(savedOrder.getId(), updateRequest);

        // then
        assertThat(response.postalCode()).isEqualTo("54321");
        assertThat(response.address()).isEqualTo("수정된 주소");
        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).quantity()).isEqualTo(5);
        assertThat(response.totalAmount()).isEqualTo(40000);
    }

    @Test
    @DisplayName("주문 수정 실패: 이미 배송 마감된 주문은 수정 시 IllegalStateException이 발생한다")
    void modifyOrder_fail_alreadyDelivered() {
        // given: 2일 전 주문 (배송 마감 시간 경과)
        Product product = productRepository.save(new Product("테스트 원두", 5000, null));
        Order order = new Order("delivered@test.com", "12345", "기존 주소", LocalDateTime.now().minusDays(2));
        order.addOrderItem(product, 1);
        Order savedOrder = orderRepository.save(order);

        OrderUpdateRequest updateRequest = new OrderUpdateRequest(
            "54321",
            "수정된 주소",
            List.of(new OrderItemRequest(product.getId(), 2))
        );

        // when & then
        assertThatThrownBy(() -> orderService.modifyOrder(savedOrder.getId(), updateRequest))
            .isInstanceOf(IllegalStateException.class)
            .hasMessage("이미 배송된 주문이라 수정할 수 없습니다.");
    }

    @Test
    @DisplayName("주문 수정 실패: 존재하지 않는 주문 ID인 경우 ResourceNotFoundException이 발생한다")
    void modifyOrder_fail_notFound() {
        // given
        Product product = productRepository.save(new Product("테스트 원두", 5000, null));
        OrderUpdateRequest updateRequest = new OrderUpdateRequest(
            "54321",
            "수정된 주소",
            List.of(new OrderItemRequest(product.getId(), 2))
        );

        // when & then
        assertThatThrownBy(() -> orderService.modifyOrder(999999L, updateRequest))
            .isInstanceOf(ResourceNotFoundException.class);
    }
    @Test
    @DisplayName("통합 조회: 이메일이 전달되면 해당 이메일의 주문만 필터링되어 반환된다")
    void getOrder_withEmail() {
        // given
        String email = "test1@test.com";

        // when
        List<OrderResponse> responses = orderService.getOrders(email);

        // then
        assertThat(responses).hasSize(2);
        assertThat(responses).allMatch(res -> res.email().equals(email));
    }

    @Test
    @DisplayName("통합 조회: 이메일이 null이거나 공백이면 전체 주문(10건)이 반환된다")
    void getOrder_nullOrBlankEmail_returnsAll() {
        // when
        List<OrderResponse> nullResult = orderService.getOrders(null);
        List<OrderResponse> blankResult = orderService.getOrders("   ");

        // then
        assertThat(nullResult).hasSize(10);
        assertThat(blankResult).hasSize(10);
    }

    // ---------- 주문 삭제 ----------
    @Test
    @DisplayName("존재하는 주문을 삭제하면 DB에서 사라진다")
    void deleteOrder_success() {

        // given
        Product product = productRepository.findAll().get(0);

        Order order = new Order(
            "delete@test.com",
            "12345",
            "서울시 강남구 테스트로 1",
            LocalDateTime.now()
        );

        order.addOrderItem(product, 1);

        Order savedOrder = orderRepository.save(order);
        Long orderId = savedOrder.getId();

        // when
        orderService.deleteOrder(orderId);

        // then
        assertThat(orderRepository.findById(orderId)).isEmpty();
    }

    @Test
    @DisplayName("존재하지 않는 id로 삭제 시도하면 예외가 발생한다")
    void deleteOrder_notFound_throwsException() {

        Long notExistId = 999999L;

        assertThatThrownBy(() -> orderService.deleteOrder(notExistId))
            .isInstanceOf(ResourceNotFoundException.class)
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

        // given
        Product product = productRepository.findAll().get(0);

        Order normalOrder = new Order(
            "normal@test.com",
            "12345",
            "서울시 강남구 테스트로 1",
            LocalDateTime.now()
        );

        normalOrder.addOrderItem(product, 1);

        Order savedNormalOrder = orderRepository.save(normalOrder);

        Order deliveredOrder = new Order(
            "delivered@test.com",
            "12345",
            "서울시 강남구 테스트로 2",
            LocalDateTime.now().minusDays(2)
        );

        deliveredOrder.addOrderItem(product, 1);

        Order savedDeliveredOrder = orderRepository.save(deliveredOrder);

        // when & then
        assertThatThrownBy(() ->
            orderService.deleteOrders(
                List.of(
                    savedNormalOrder.getId(),
                    savedDeliveredOrder.getId()
                )
            )
        )
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("이미 배송된 주문이라 삭제할 수 없습니다");

        assertThat(orderRepository.findById(savedNormalOrder.getId()))
            .isPresent();

        assertThat(orderRepository.findById(savedDeliveredOrder.getId()))
            .isPresent();
    }
}