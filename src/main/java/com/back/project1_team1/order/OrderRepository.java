package com.back.project1_team1.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    // 주문일(orderDate)가 start (ex: 8/24 14:00) 이상,
    // end (ex: 8/25 14:00)미만인 주문 목록 조회
    List<Order> findByOrderDateGreaterThanEqualAndOrderDateLessThan(
        LocalDateTime start,
        LocalDateTime end
    );
}
