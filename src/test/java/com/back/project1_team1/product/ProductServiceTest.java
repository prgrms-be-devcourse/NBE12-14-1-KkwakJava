package com.back.project1_team1.product;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.back.project1_team1.global.ResourceNotFoundException;
import com.back.project1_team1.product.dto.ProductCreateRequest;
import com.back.project1_team1.product.dto.ProductUpdateRequest;
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
class ProductServiceTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @Test
    @DisplayName("상품 등록: 상품명, 가격, 이미지 URL을 입력하면 저장된다")
    void createProduct_success() {
        // given
        ProductCreateRequest request = new ProductCreateRequest(
                "상품 등록 테스트 원두",
                6500,
                "https://example.com/coffee.jpg"
        );

        // when
        Product product = productService.createProduct(request);

        // then
        assertThat(product.getId()).isNotNull();
        assertThat(product.getName()).isEqualTo("상품 등록 테스트 원두");
        assertThat(product.getPrice()).isEqualTo(6500);
        assertThat(product.getImageUrl()).isEqualTo("https://example.com/coffee.jpg");
    }

    @Test
    @DisplayName("상품 등록 실패: 같은 상품명으로 등록하면 예외가 발생한다")
    void createProduct_fail_duplicateName() {
        // given
        productService.createProduct(
                new ProductCreateRequest("중복 등록 테스트 원두", 5000, null)
        );

        ProductCreateRequest duplicateRequest = new ProductCreateRequest(
                "중복 등록 테스트 원두",
                7000,
                null
        );

        // when & then
        assertThatThrownBy(() -> productService.createProduct(duplicateRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("이미 존재하는 상품명입니다.");
    }

    @Test
    @DisplayName("상품 전체 조회: 등록한 상품이 목록에 포함된다")
    void getProducts_success() {
        // given
        productService.createProduct(
                new ProductCreateRequest("전체 조회 테스트 원두 A", 5000, null)
        );
        productService.createProduct(
                new ProductCreateRequest("전체 조회 테스트 원두 B", 6000, null)
        );

        // when
        List<Product> products = productService.getProducts();

        // then
        assertThat(products)
                .extracting(Product::getName)
                .contains("전체 조회 테스트 원두 A", "전체 조회 테스트 원두 B");
    }

    @Test
    @DisplayName("상품 단건 조회: 존재하는 상품 ID로 조회하면 해당 상품을 반환한다")
    void getProduct_success() {
        // given
        Product savedProduct = productService.createProduct(
                new ProductCreateRequest("단건 조회 테스트 원두", 5500, null)
        );

        // when
        Product product = productService.getProduct(savedProduct.getId());

        // then
        assertThat(product.getId()).isEqualTo(savedProduct.getId());
        assertThat(product.getName()).isEqualTo("단건 조회 테스트 원두");
    }

    @Test
    @DisplayName("상품 단건 조회 실패: 존재하지 않는 상품 ID면 예외가 발생한다")
    void getProduct_fail_notFound() {
        assertThatThrownBy(() -> productService.getProduct(999999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("존재하지 않는 상품입니다.");
    }

    @Test
    @DisplayName("상품 수정: 상품명, 가격, 이미지 URL을 변경할 수 있다")
    void updateProduct_success() {
        // given
        Product savedProduct = productService.createProduct(
                new ProductCreateRequest("수정 전 원두", 5000, null)
        );

        ProductUpdateRequest request = new ProductUpdateRequest(
                "수정 후 원두",
                7500,
                "https://example.com/updated-coffee.jpg"
        );

        // when
        Product updatedProduct = productService.updateProduct(savedProduct.getId(), request);

        // then
        assertThat(updatedProduct.getName()).isEqualTo("수정 후 원두");
        assertThat(updatedProduct.getPrice()).isEqualTo(7500);
        assertThat(updatedProduct.getImageUrl())
                .isEqualTo("https://example.com/updated-coffee.jpg");
    }

    @Test
    @DisplayName("상품 수정: 자신의 기존 상품명으로 수정해도 정상 처리된다")
    void updateProduct_success_sameName() {
        // given
        Product savedProduct = productService.createProduct(
                new ProductCreateRequest("이름 유지 테스트 원두", 5000, null)
        );

        ProductUpdateRequest request = new ProductUpdateRequest(
                "이름 유지 테스트 원두",
                7000,
                "https://example.com/same-name.jpg"
        );

        // when
        Product updatedProduct = productService.updateProduct(savedProduct.getId(), request);

        // then
        assertThat(updatedProduct.getName()).isEqualTo("이름 유지 테스트 원두");
        assertThat(updatedProduct.getPrice()).isEqualTo(7000);
        assertThat(updatedProduct.getImageUrl())
                .isEqualTo("https://example.com/same-name.jpg");
    }

    @Test
    @DisplayName("상품 수정 실패: 다른 상품의 이름으로 수정하면 예외가 발생한다")
    void updateProduct_fail_duplicateName() {
        // given
        Product firstProduct = productService.createProduct(
                new ProductCreateRequest("상품명 중복 수정 A", 5000, null)
        );
        productService.createProduct(
                new ProductCreateRequest("상품명 중복 수정 B", 6000, null)
        );

        ProductUpdateRequest request = new ProductUpdateRequest(
                "상품명 중복 수정 B",
                7000,
                null
        );

        // when & then
        assertThatThrownBy(() -> productService.updateProduct(firstProduct.getId(), request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("이미 존재하는 상품명입니다.");
    }

    @Test
    @DisplayName("상품 수정 실패: 존재하지 않는 상품 ID면 예외가 발생한다")
    void updateProduct_fail_notFound() {
        // given
        ProductUpdateRequest request = new ProductUpdateRequest(
                "없는 상품 수정",
                5000,
                null
        );

        // when & then
        assertThatThrownBy(() -> productService.updateProduct(999999L, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("존재하지 않는 상품입니다.");
    }

    @Test
    @DisplayName("상품 삭제: 존재하는 상품을 삭제하면 더 이상 조회되지 않는다")
    void deleteProduct_success() {
        // given
        Product savedProduct = productService.createProduct(
                new ProductCreateRequest("삭제 테스트 원두", 5000, null)
        );

        // when
        productService.deleteProduct(savedProduct.getId());
        productRepository.flush();

        // then
        assertThat(productRepository.findById(savedProduct.getId())).isEmpty();
    }

    @Test
    @DisplayName("상품 삭제 실패: 존재하지 않는 상품 ID면 예외가 발생한다")
    void deleteProduct_fail_notFound() {
        assertThatThrownBy(() -> productService.deleteProduct(999999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("존재하지 않는 상품입니다.");
    }
}