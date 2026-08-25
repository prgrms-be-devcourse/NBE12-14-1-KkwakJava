package com.back.project1_team1.product;

import com.back.project1_team1.product.dto.ProductCreateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@RequiredArgsConstructor
@Service
public class ProductService {

    private final ProductRepository productRepository;

    public void createProduct(ProductCreateRequest request)  {

        Product product = new Product(
                request.getName(),
                request.getPrice()
        );

        productRepository.save(product);

    }

}
