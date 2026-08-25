package com.back.project1_team1.order.dto;

import java.util.List;

/*
    주문 생성 API(POST /orders)의 요청 데이터를 받는 DTO
    고객 이메일과 주문할 상품 목록을 클라이언트로부터 전달받음
    주문 ID는 DB에서 자동 생성, 주문 시각은 서버에서 생성하므로
    클라이언트에서는 고객 이메일, 상룸 목록만 전달
 */

public record OrderCreateRequest(
    String email,
    String postalCode,
    String address,
    List<OrderItemRequest> items // 한 건의 주문에 포함된 상품 목록
) {

}
