package com.back.project1_team1.product;


import com.back.project1_team1.product.dto.ProductCreateRequest;
import com.back.project1_team1.product.dto.ProductUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductService productService;


    @PostMapping
    public Product createProduct(@RequestBody ProductCreateRequest request) {
        return productService.createProduct(request);
    }

    @GetMapping
    public List<Product> getProducts() {
        return productService.getProducts();
    }

    @GetMapping("{id}")
    public Product getProduct(
            @PathVariable int id
    ) {
        return productService.getProduct(id);
    }

    @PutMapping("{id}")
    public Product updateProduct(
            @PathVariable int id,
            @RequestBody ProductUpdateRequest request
    ) {
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("{id}")
    public void deleteProduct(
            @PathVariable int id
    ) {
        productService.deleteProduct(id);
    }

}
