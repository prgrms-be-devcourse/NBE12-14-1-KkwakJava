package com.back.project1_team1.order;

import com.back.project1_team1.order.dto.OrderResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.Mapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;


    @GetMapping
    public List<OrderResponse> getOrders(@RequestParam(required = false) String email) {
        if(email != null && !email.isBlank()){
            return this.orderService.findByEmail(email);
        }

        return this.orderService.findAll();
    }


}
