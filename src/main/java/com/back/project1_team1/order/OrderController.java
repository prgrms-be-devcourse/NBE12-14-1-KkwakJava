package com.back.project1_team1.order;

import com.back.project1_team1.order.dto.OrderCreateRequest;
import lombok.RequiredArgsConstructor;
import org.osgi.annotation.versioning.ProviderType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public String orderList(Model model) {
        model.addAttribute("orders", orderService.findAll());
        return "order/list"; // templates/order/list.html
    }

    @DeleteMapping("/{orderId}")
   public String deleteOrder(
       @PathVariable Integer orderId,
        Model model
    ){
        try{
            orderService.deleteOrder(orderId);
        }catch (IllegalArgumentException e){
            model.addAttribute("error", "존재하지 않는 주문입니다");
        }catch (IllegalStateException e){
            model.addAttribute("error", e.getMessage());
        }
            return "redirect:/orders"; //삭제 후 목록으로 이동

    }

    // 주문 생성 API
    // 클라이언트의 주문 요청을 받아 OrderService에 전달
    @PostMapping
    @ResponseBody
    public void createOrder(@RequestBody OrderCreateRequest request) {
        orderService.createOrder(request); // 주문 생성 요청
    }
}
