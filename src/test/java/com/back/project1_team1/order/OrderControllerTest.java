package com.back.project1_team1.order;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.back.project1_team1.product.Product;
import com.back.project1_team1.product.ProductRepository;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Test
    @DisplayName("이메일이 비어 있으면 주문 생성 요청은 400을 반환한다")
    void createOrder_emptyEmail_badRequest() throws Exception {

        String requestJson = """
        {
            "email": "",
            "postalCode": "12345",
            "address": "서울시 강남구 테스트로 1",
            "items": [
                {
                    "productId": 1,
                    "quantity": 2
                }
            ]
        }
        """;

        mockMvc.perform(
                post("/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson)
            )
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("이메일 형식이 잘못되면 주문 생성 요청은 400을 반환한다")
    void createOrder_invalidEmail_badRequest() throws Exception {

        String requestJson = """
        {
            "email": "test",
            "postalCode": "12345",
            "address": "서울시 강남구 테스트로 1",
            "items": [
                {
                    "productId": 1,
                    "quantity": 2
                }
            ]
        }
        """;

        mockMvc.perform(
                post("/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson)
            )
            .andExpect(status().isBadRequest());
    }


    @Test
    @DisplayName("우편번호가 비어 있으면 주문 생성 요청은 400을 반환한다")
    void createOrder_emptyPostalCode_badRequest() throws Exception {

        String requestJson = """
        {
            "email": "test@test.com",
            "postalCode": "",
            "address": "서울시 강남구 테스트로 1",
            "items": [
                {
                    "productId": 1,
                    "quantity": 2
                }
            ]
        }
        """;

        mockMvc.perform(
                post("/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson)
            )
            .andExpect(status().isBadRequest());
    }


    @Test
    @DisplayName("주소가 비어 있으면 주문 생성 요청은 400을 반환한다")
    void createOrder_emptyAddress_badRequest() throws Exception {

        String requestJson = """
        {
            "email": "test@test.com",
            "postalCode": "12345",
            "address": "",
            "items": [
                {
                    "productId": 1,
                    "quantity": 2
                }
            ]
        }
        """;

        mockMvc.perform(
                post("/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson)
            )
            .andExpect(status().isBadRequest());
    }


    @Test
    @DisplayName("주문 상품이 없으면 주문 생성 요청은 400을 반환한다")
    void createOrder_emptyItems_badRequest() throws Exception {

        String requestJson = """
        {
            "email": "test@test.com",
            "postalCode": "12345",
            "address": "서울시 강남구 테스트로 1",
            "items": []
        }
        """;

        mockMvc.perform(
                post("/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson)
            )
            .andExpect(status().isBadRequest());
    }


    @Test
    @DisplayName("상품 수량이 0이면 주문 생성 요청은 400을 반환한다")
    void createOrder_zeroQuantity_badRequest() throws Exception {

        String requestJson = """
        {
            "email": "test@test.com",
            "postalCode": "12345",
            "address": "서울시 강남구 테스트로 1",
            "items": [
                {
                    "productId": 1,
                    "quantity": 0
                }
            ]
        }
        """;

        mockMvc.perform(
                post("/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson)
            )
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("정상적인 주문 생성 요청은 201을 반환한다")
    void createOrder_success() throws Exception {

        // given: 주문할 상품을 테스트 DB에 먼저 저장
        Product product = productRepository.save(
            new Product("Colombia Narino", 5000, null)
        );

        String requestJson = """
        {
            "email": "test@test.com",
            "postalCode": "12345",
            "address": "서울시 강남구 테스트로 1",
            "items": [
                {
                    "productId": %d,
                    "quantity": 2
                }
            ]
        }
        """.formatted(product.getId());

        // when & then
        mockMvc.perform(
                post("/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson)
            )
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.orderId").exists())
            .andExpect(jsonPath("$.email").value("test@test.com"))
            .andExpect(jsonPath("$.postalCode").value("12345"))
            .andExpect(jsonPath("$.address").value("서울시 강남구 테스트로 1"))
            .andExpect(jsonPath("$.totalAmount").value(10000))
            .andExpect(jsonPath("$.items[0].productName").value("Colombia Narino"))
            .andExpect(jsonPath("$.items[0].quantity").value(2));
    }

    @Test
    @DisplayName("동일한 상품을 중복하여 주문하면 400 Bad Request를 반환한다")
    void createOrder_duplicateProduct_badRequest() throws Exception {

        // given : 주문할 상품을 DB에 저장
        Product product = productRepository.save(
            new Product("Colombia Narino", 5000, null)
        );

        String requestJson = """
    {
        "email": "test@test.com",
        "postalCode": "12345",
        "address": "서울시 강남구 테스트로 1",
        "items": [
            {
                "productId": %d,
                "quantity": 2
            },
            {
                "productId": %d,
                "quantity": 3
            }
        ]
    }
    """.formatted(product.getId(), product.getId());

        // when & then
        mockMvc.perform(
                post("/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson)
            )
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.error").value("BAD_REQUEST"))
            .andExpect(jsonPath("$.message")
                .value("동일한 상품을 중복하여 주문할 수 없습니다."));
    }

    @Test
    @DisplayName("존재하지 않는 상품 ID로 주문하면 404 Not Found를 반환한다")
    void createOrder_invalidProduct_notFound() throws Exception {

        String requestJson = """
    {
        "email": "test@test.com",
        "postalCode": "12345",
        "address": "서울시 강남구 테스트로 1",
        "items": [
            {
                "productId": 999999,
                "quantity": 2
            }
        ]
    }
    """;

        mockMvc.perform(
                post("/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson)
            )
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.error").value("NOT_FOUND"))
            .andExpect(jsonPath("$.message")
                .value("존재하지 않는 상품입니다. id = 999999"));
    }

    @Test
    @DisplayName("상품 ID가 null이면 주문 생성 요청은 400 Bad Request를 반환한다")
    void createOrder_nullProductId_badRequest() throws Exception {

        String requestJson = """
    {
        "email": "test@test.com",
        "postalCode": "12345",
        "address": "서울시 강남구 테스트로 1",
        "items": [
            {
                "productId": null,
                "quantity": 2
            }
        ]
    }
    """;

        mockMvc.perform(
                post("/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson)
            )
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.error").value("BAD_REQUEST"))
            .andExpect(jsonPath("$.message")
                .value("상품 ID는 필수입니다."));
    }

    @Test
    @DisplayName("주문 상품 목록이 null이면 주문 생성 요청은 400 Bad Request를 반환한다")
    void createOrder_nullItems_badRequest() throws Exception {

        String requestJson = """
            {
                "email": "test@test.com",
                "postalCode": "12345",
                "address": "서울시 강남구 테스트로 1",
                "items": null
            }
            """;

        mockMvc.perform(
                post("/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson)
            )
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.error").value("BAD_REQUEST"))
            .andExpect(jsonPath("$.message")
                .value("주문 상품은 최소 1개 이상이어야 합니다."));
    }
    @Test
    @DisplayName("정상적인 주문 수정 요청은 200 OK와 함께 수정된 정보를 반환한다")
    void modifyOrder_success() throws Exception {
        // given
        Product product = productRepository.save(new Product("Colombia Narino", 5000, null));
        Order order = new Order("test@test.com", "12345", "서울시 강남구", LocalDateTime.now());
        order.addOrderItem(product, 1);
        Order savedOrder = orderRepository.save(order);

        String updateJson = """
        {
            "postalCode": "99999",
            "address": "서울시 송파구 수정로 2",
            "items": [
                {
                    "productId": %d,
                    "quantity": 3
                }
            ]
        }
        """.formatted(product.getId());

        // when & then
        mockMvc.perform(
                put("/orders/" + savedOrder.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(updateJson)
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.orderId").value(savedOrder.getId()))
            .andExpect(jsonPath("$.postalCode").value("99999"))
            .andExpect(jsonPath("$.address").value("서울시 송파구 수정로 2"))
            .andExpect(jsonPath("$.totalAmount").value(15000))
            .andExpect(jsonPath("$.items[0].quantity").value(3));
    }

    @Test
    @DisplayName("주문 수정 시 주문 상품이 비어있으면 400 Bad Request를 반환한다")
    void modifyOrder_emptyItems_badRequest() throws Exception {
        String updateJson = """
        {
            "postalCode": "99999",
            "address": "서울시 송파구 수정로 2",
            "items": []
        }
        """;

        mockMvc.perform(
                put("/orders/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(updateJson)
            )
            .andExpect(status().isBadRequest());
    }
}