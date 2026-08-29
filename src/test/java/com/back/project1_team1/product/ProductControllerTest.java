package com.back.project1_team1.product;

import static org.hamcrest.Matchers.hasItems;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.back.project1_team1.product.entity.Product;
import com.back.project1_team1.product.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Test
    @DisplayName("상품 등록: 정상 요청이면 201 CREATED와 상품 정보를 반환한다")
    void createProduct_success() throws Exception {
        String requestJson = """
            {
              "name": "API 등록 테스트 원두",
              "price": 6500,
              "imageUrl": "https://example.com/coffee.jpg"
            }
            """;

        mockMvc.perform(
                        post("/products")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestJson)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("API 등록 테스트 원두"))
                .andExpect(jsonPath("$.price").value(6500))
                .andExpect(jsonPath("$.imageUrl").value("https://example.com/coffee.jpg"));
    }

    @Test
    @DisplayName("상품 등록 실패: 상품명이 공백이면 400 BAD_REQUEST를 반환한다")
    void createProduct_fail_blankName() throws Exception {
        String requestJson = """
            {
              "name": " ",
              "price": 5000,
              "imageUrl": null
            }
            """;

        mockMvc.perform(
                        post("/products")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestJson)
                )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.message[0]").value("상품 이름은 필수입니다."));
    }

    @Test
    @DisplayName("상품 등록 실패: 가격이 없으면 400 BAD_REQUEST를 반환한다")
    void createProduct_fail_nullPrice() throws Exception {
        String requestJson = """
            {
              "name": "가격 없는 원두",
              "price": null,
              "imageUrl": null
            }
            """;

        mockMvc.perform(
                        post("/products")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestJson)
                )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.message[0]").value("상품 가격은 필수입니다."));
    }

    @Test
    @DisplayName("상품 등록 실패: 가격이 음수면 400 BAD_REQUEST를 반환한다")
    void createProduct_fail_negativePrice() throws Exception {
        String requestJson = """
            {
              "name": "음수 가격 원두",
              "price": -1,
              "imageUrl": null
            }
            """;

        mockMvc.perform(
                        post("/products")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestJson)
                )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.message[0]").value("상품 가격은 0 이상이여야 합니다."));
    }

    @Test
    @DisplayName("상품 등록 실패: 중복 상품명이면 400 BAD_REQUEST를 반환한다")
    void createProduct_fail_duplicateName() throws Exception {
        productRepository.save(new Product("중복 API 테스트 원두", 5000, null));

        String requestJson = """
            {
              "name": "중복 API 테스트 원두",
              "price": 7000,
              "imageUrl": null
            }
            """;

        mockMvc.perform(
                        post("/products")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestJson)
                )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.message[0]").value("이미 존재하는 상품명입니다."));
    }

    @Test
    @DisplayName("상품 전체 조회: 등록된 상품 목록을 반환한다")
    void getProducts_success() throws Exception {
        productRepository.save(new Product("전체 조회 API 원두 A", 5000, null));
        productRepository.save(new Product("전체 조회 API 원두 B", 6000, null));

        mockMvc.perform(get("/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name",
                        hasItems("전체 조회 API 원두 A", "전체 조회 API 원두 B")));
    }

    @Test
    @DisplayName("상품 단건 조회: 존재하는 상품 ID면 200 OK와 상품 정보를 반환한다")
    void getProduct_success() throws Exception {
        Product product = productRepository.save(
                new Product("단건 조회 API 원두", 5500, "https://example.com/detail.jpg")
        );

        mockMvc.perform(get("/products/" + product.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(product.getId()))
                .andExpect(jsonPath("$.name").value("단건 조회 API 원두"))
                .andExpect(jsonPath("$.price").value(5500))
                .andExpect(jsonPath("$.imageUrl").value("https://example.com/detail.jpg"));
    }

    @Test
    @DisplayName("상품 단건 조회 실패: 존재하지 않는 상품 ID면 404 NOT_FOUND를 반환한다")
    void getProduct_fail_notFound() throws Exception {
        mockMvc.perform(get("/products/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("NOT_FOUND"))
                .andExpect(jsonPath("$.message[0]")
                        .value("존재하지 않는 상품입니다. id = 999999"));
    }

    @Test
    @DisplayName("상품 수정: 정상 요청이면 200 OK와 수정된 상품 정보를 반환한다")
    void updateProduct_success() throws Exception {
        Product product = productRepository.save(
                new Product("수정 전 API 원두", 5000, null)
        );

        String requestJson = """
            {
              "name": "수정 후 API 원두",
              "price": 7500,
              "imageUrl": "https://example.com/updated.jpg"
            }
            """;

        mockMvc.perform(
                        put("/products/" + product.getId())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestJson)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(product.getId()))
                .andExpect(jsonPath("$.name").value("수정 후 API 원두"))
                .andExpect(jsonPath("$.price").value(7500))
                .andExpect(jsonPath("$.imageUrl").value("https://example.com/updated.jpg"));
    }

    @Test
    @DisplayName("상품 수정 실패: 존재하지 않는 상품 ID면 404 NOT_FOUND를 반환한다")
    void updateProduct_fail_notFound() throws Exception {
        String requestJson = """
            {
              "name": "없는 상품 수정",
              "price": 5000,
              "imageUrl": null
            }
            """;

        mockMvc.perform(
                        put("/products/999999")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestJson)
                )
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }

    @Test
    @DisplayName("상품 삭제: 존재하는 상품 ID면 204 NO_CONTENT를 반환한다")
    void deleteProduct_success() throws Exception {
        Product product = productRepository.save(
                new Product("삭제 API 테스트 원두", 5000, null)
        );

        mockMvc.perform(delete("/products/" + product.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("상품 삭제 실패: 존재하지 않는 상품 ID면 404 NOT_FOUND를 반환한다")
    void deleteProduct_fail_notFound() throws Exception {
        mockMvc.perform(delete("/products/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }
}