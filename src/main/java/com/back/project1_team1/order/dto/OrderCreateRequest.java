package com.back.project1_team1.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/*
    주문 생성 API(POST /orders)의 요청 데이터를 받는 DTO
    고객 이메일과 주문할 상품 목록을 클라이언트로부터 전달받음
    주문 ID는 DB에서 자동 생성, 주문 시각은 서버에서 생성하므로
    클라이언트에서는 고객 이메일, 상룸 목록만 전달
 */

public record OrderCreateRequest(

    @NotBlank(message = "이메일을 입력해주세요.")
    @Email(message = "올바른 이메일 형식이어야 합니다. (ex@ex.com)")
    String email,

    @NotBlank(message = "우편번호를 입력해주세요.")
    String postalCode,

    @NotBlank(message = "주소를 입력해주세요.")
    String address,

    @NotEmpty(message = "주문 상품은 최소 1개 이상이어야 합니다.")
    List<@Valid OrderItemRequest> items // 한 건의 주문에 포함된 상품 목록
) {

}
