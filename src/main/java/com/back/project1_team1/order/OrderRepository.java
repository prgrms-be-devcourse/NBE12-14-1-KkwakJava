package com.back.project1_team1.order;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // orderItems뿐만 아니라 그 안에 있는 product까지 한 번에 fetch join
    @Override
    @EntityGraph(attributePaths = {"orderItems", "orderItems.product"})
    List<Order> findAll();

    @EntityGraph(attributePaths = {"orderItems", "orderItems.product"})
    List<Order> findByEmail(String email);

    // 주문일(orderDate)가 start (ex: 8/24 14:00) 이상,
    // end (ex: 8/25 14:00)미만인 주문 목록 조회
    @EntityGraph(attributePaths = {"orderItems", "orderItems.product"})
    List<Order> findByOrderDateGreaterThanEqualAndOrderDateLessThan(
        LocalDateTime start,
        LocalDateTime end
    );

    // 이메일 + 주문 시간 범위로 배송 대상 주문 조회
    @EntityGraph(attributePaths = {"orderItems", "orderItems.product"})
    List<Order> findByEmailAndOrderDateGreaterThanEqualAndOrderDateLessThan(
        String email,
        LocalDateTime start,
        LocalDateTime end
    );
}
