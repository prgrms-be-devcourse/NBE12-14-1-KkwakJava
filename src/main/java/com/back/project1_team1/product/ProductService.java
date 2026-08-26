package com.back.project1_team1.product;

import com.back.project1_team1.product.dto.ProductCreateRequest;
import com.back.project1_team1.product.dto.ProductUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductImageService productImageService;
    private final ProductRepository productRepository;

    // 상품 등록
    @Transactional
    public Product createProduct(ProductCreateRequest request) {

        // 이미지 저장 후 이미지 URL을 가져온다.
        String imageUrl = productImageService.save(request.image());

        Product product = new Product(
                request.name(),
                request.price(),
                imageUrl
        );

        return productRepository.save(product);
    }

    // 상품 전체 조회
    public List<Product> getProducts() {
        return productRepository.findAll();
    }

    // 상품 단건 조회
    public Product getProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException( "존재하지 않는 상품입니다. id = " + id)
                );
    }

    // 상품 수정
    @Transactional
    public Product updateProduct(Long id, ProductUpdateRequest request) {

        Product product = productRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException( "존재하지 않는 상품입니다. id = " + id)
                        );

        // 기존 이미지 URL을 유지
        String imageUrl = product.getImageUrl();

        // 새로운 이미지가 첨부된 경우에만 이미지를 저장
        if (request.image() != null && !request.image().isEmpty()) {
            imageUrl = productImageService.save(request.image());
        }

        product.update(
                request.name(),
                request.price(),
                imageUrl
        );

        return product;
    }

    // 상품 삭제
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("존재하지 않는 상품입니다. id = " + id)
                );

        productRepository.delete(product);
    }

}
