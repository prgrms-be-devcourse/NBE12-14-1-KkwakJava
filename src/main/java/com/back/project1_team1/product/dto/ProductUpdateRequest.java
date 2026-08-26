package com.back.project1_team1.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ProductUpdateRequest(

        @NotBlank(message = "수정할 상품 이름은 필수입니다.")
        String name,

        @NotNull(message = "수정할 상품 가격은 필수입니다.")
        @PositiveOrZero(message = "수정할 상품 가격은 0 이상이여야 합니다.")
        Integer price
) {
}