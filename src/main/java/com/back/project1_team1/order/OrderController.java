package com.back.project1_team1.order;

import com.back.project1_team1.order.dto.OrderCreateRequest;
import com.back.project1_team1.order.dto.OrderResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // 주문 목록 및 이메일 조건 조회 (JSON 응답)
    @GetMapping
    @ResponseBody
    public List<OrderResponse> getOrders(@RequestParam(required = false) String email) {
        if (email != null && !email.isBlank()) {
            return this.orderService.findByEmail(email);
        }

        return this.orderService.findAll();
    }

    // 주문 생성 API
    // 클라이언트의 주문 요청을 받아 OrderService에 전달
    @PostMapping
    @ResponseBody
    public OrderResponse createOrder(@Valid @RequestBody OrderCreateRequest request) {
        return orderService.createOrder(request); // 주문 생성 요청
    }

    //단건 삭제
    @DeleteMapping("/{orderId}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.noContent().build();
    }

    //다건삭제
    @DeleteMapping
    public ResponseEntity<?> deleteOrders(
        @RequestParam List<Long> orderIds) {
        orderService.deleteOrders(orderIds);
        return ResponseEntity.noContent().build();
    }
}
