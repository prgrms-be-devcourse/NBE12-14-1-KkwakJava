package com.back.project1_team1.product;

import com.back.project1_team1.product.dto.ProductCreateRequest;
import com.back.project1_team1.product.dto.ProductUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@RequiredArgsConstructor
@Service
public class ProductService {

    private final ProductRepository productRepository;

    public Product createProduct(ProductCreateRequest request)  {

        Product product = new Product(
                request.name(),
                request.price()
        );

        return  productRepository.save(product);
    }

    public List<Product> getProducts()   {
        return productRepository.findAll();
    }

    public Product getProduct(int id) {
        return productRepository.findById(id).get();
    }

    public Product updateProduct(int id, ProductUpdateRequest request)   {

        Product product = productRepository.findById(id).get();

        product.setName(request.name());
        product.setPrice(request.price());

        return product;
    }

    public void deleteProduct(int id)   {
        productRepository.deleteById(id);
    }

}
