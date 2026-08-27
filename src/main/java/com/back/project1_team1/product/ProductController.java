package com.back.project1_team1.product;


import com.back.project1_team1.product.dto.ProductCreateRequest;
import com.back.project1_team1.product.dto.ProductResponse;
import com.back.project1_team1.product.dto.ProductUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductService productService;


    // 상품 등록
    // POST /products
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(
            @Valid @RequestBody ProductCreateRequest request
    ) {

        Product product = productService.createProduct(request);

        return new ProductResponse(product);
    }

    // 상품 전체 조회
    // GET /products
    @GetMapping
    public List<ProductResponse> getProducts() {

        List<Product> products = productService.getProducts();

        List<ProductResponse> responses = products.stream()
                .map(ProductResponse::new)
                .toList();

        return responses;
    }

    // 상품 단건 조회
    // GET /products/{id}
    @GetMapping("{id}")
    public ProductResponse getProduct(
            @PathVariable Long id
    ) {
        Product product = productService.getProduct(id);

        return new ProductResponse(product);
    }

    // 상품 수정
    // PUT /products/{id}
    @PutMapping("{id}")
    public ProductResponse updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {
        Product product = productService.updateProduct(id, request);

        return new ProductResponse(product);
    }

    // 상품 삭제
    // DELETE /products/{id}
    @DeleteMapping("{id}")
    public void deleteProduct(
            @PathVariable Long id
    ) {
        productService.deleteProduct(id);
    }

}
