package com.back.project1_team1.order;

import org.osgi.annotation.versioning.ProviderType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @DeleteMapping("/{orderId}")
   public void deleteOrder(
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

}
