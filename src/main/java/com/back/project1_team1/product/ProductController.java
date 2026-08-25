package com.back.project1_team1.product;


import com.back.project1_team1.product.dto.ProductCreateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductService productService;


    @PostMapping
    public void createProduct(@RequestBody ProductCreateRequest request) {
        productService.createProduct(request);
    }

}
