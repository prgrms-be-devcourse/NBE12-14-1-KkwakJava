package com.back.project1_team1.global;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("ResourceNotFoundException 발생 시 404 NOT_FOUND와 에러 메시지를 반환한다.")
    void handleResourceNotFound() {
        // given
        ResourceNotFoundException exception = new ResourceNotFoundException("존재하지 않는 주문입니다. id = 99");

        // when
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> response = handler.handleResourceNotFound(exception);

        // then
        assertNotNull(response.getBody());
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals(404, response.getBody().status());
        assertEquals("NOT_FOUND", response.getBody().error());
        assertEquals("존재하지 않는 주문입니다. id = 99", response.getBody().message());
    }

    @Test
    @DisplayName("IllegalArgumentException 발생 시 400 BAD_REQUEST와 에러 메시지를 반환한다.")
    void handleIllegalArgument() {
        // given
        IllegalArgumentException exception = new IllegalArgumentException("상품 가격은 0 이상이어야 합니다.");

        // when
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> response = handler.handleIllegalArgument(exception);

        // then
        assertNotNull(response.getBody());
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(400, response.getBody().status());
        assertEquals("BAD_REQUEST", response.getBody().error());
        assertEquals("상품 가격은 0 이상이어야 합니다.", response.getBody().message());
    }

    @Test
    @DisplayName("IllegalStateException 발생 시 409 CONFLICT와 에러 메시지를 반환한다.")
    void handleIllegalState() {
        // given
        IllegalStateException exception = new IllegalStateException("이미 배송 완료된 주문은 취소할 수 없습니다.");

        // when
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> response =
            handler.handleIllegalState(exception);

        // then
        assertNotNull(response.getBody());
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals(409, response.getBody().status());
        assertEquals("CONFLICT", response.getBody().error());
        assertEquals("이미 배송 완료된 주문은 취소할 수 없습니다.", response.getBody().message());
    }

    @Test
    @DisplayName("서버 미처리 Exception 발생 시 500 INTERNAL_SERVER_ERROR와 고정 에러 메시지를 반환한다.")
    void handleGeneralException() {
        // given
        Exception exception = new Exception("DB 연결 실패 등 예상치 못한 에러");

        // when
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> response = handler.handleGeneralException(exception);

        // then
        assertNotNull(response.getBody());
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals(500, response.getBody().status());
        assertEquals("INTERNAL_SERVER_ERROR", response.getBody().error());
        assertEquals("서버 내부 오류가 발생했습니다.", response.getBody().message());
    }
}