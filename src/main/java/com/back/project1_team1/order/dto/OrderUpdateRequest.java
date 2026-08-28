package com.back.project1_team1.order.dto;


import com.back.project1_team1.order.OrderItemRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import java.util.List;

public record OrderUpdateRequest(
    @NotBlank(message = "우편번호를 입력해주세요.")
    @Pattern(
        regexp = "^\\d{5}$",
        message = "우편번호는 5자리 숫자로 입력해주세요."
    )
    String postalCode,

    @NotBlank(message = "주소를 입력해주세요.")
    String address,

    @NotEmpty(message = "주문은 최소 1개 이상이어야 합니다.")
    List<@Valid OrderItemRequest> items
) {


}
