package com.back.project1_team1.order;

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
}
