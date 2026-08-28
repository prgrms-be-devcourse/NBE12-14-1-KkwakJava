package com.back.project1_team1.global;

import jakarta.validation.ConstraintViolationException;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 에러 응답용 표준 Record DTO
    public record ErrorResponse(int status, String error, List<String> message) {
    }

    // 400 BAD_REQUEST: DTO Validation(@Valid) 검증 실패
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
        MethodArgumentNotValidException e) {

        List<String> messages = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .toList();

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse(
                400,
                "BAD_REQUEST",
                messages
            ));
    }

    // 404 NOT_FOUND: 요청한 데이터가 존재하지 않음
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
        ResourceNotFoundException e) {

        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(
                404,
                "NOT_FOUND",
                List.of(e.getMessage())
            ));
    }

    // 400 BAD_REQUEST: 잘못된 요청/인자
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
        IllegalArgumentException e) {

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse(
                400,
                "BAD_REQUEST",
                List.of(e.getMessage())
            ));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
        ConstraintViolationException e){

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse(
                400,
                "BAD_REQUEST",
                List.of(e.getMessage())
            ));

    }

    // 409 CONFLICT: 현재 리소스의 상태와 충돌하여 요청을 수행할 수 없음
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(
        IllegalStateException e) {

        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(new ErrorResponse(
                409,
                "CONFLICT",
                List.of(e.getMessage())
            ));
    }

    // 500 INTERNAL_SERVER_ERROR: 서버 내부 미처리 예외
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(
        Exception e) {

        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse(
                500,
                "INTERNAL_SERVER_ERROR",
                List.of("서버 내부 오류가 발생했습니다.")
            ));
    }
}