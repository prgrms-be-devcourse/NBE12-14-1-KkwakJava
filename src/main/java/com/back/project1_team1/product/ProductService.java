package com.back.project1_team1.product;

import com.back.project1_team1.product.dto.ProductCreateRequest;
import com.back.project1_team1.product.dto.ProductUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@RequiredArgsConstructor
@Service
public class ProductService {

    private final ProductRepository productRepository;

    // 상품 등록
    public Product createProduct(ProductCreateRequest request) {

        Product product = new Product(
                request.name(),
                request.price()
        );

        return productRepository.save(product);
    }

    // 상품 전체 조회
    public List<Product> getProducts() {
        return productRepository.findAll();
    }

    // 상품 단건 조회
    public Product getProduct(Long id) {
        return productRepository.findById(id).get();
    }

    // 상품 수정
    @Transactional
    public Product updateProduct(Long id, ProductUpdateRequest request) {

        Product product = productRepository.findById(id).get();

        product.update(request.name(), request.price());

        return product;
    }

    // 상품 삭제
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

}
