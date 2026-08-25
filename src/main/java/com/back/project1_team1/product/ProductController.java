package com.back.project1_team1.product;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;

@Controller
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

}
