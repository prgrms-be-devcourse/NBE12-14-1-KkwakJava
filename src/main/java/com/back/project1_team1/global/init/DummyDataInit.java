package com.back.project1_team1.global.init;

import com.back.project1_team1.order.Order;
import com.back.project1_team1.order.OrderRepository;
import com.back.project1_team1.product.Product;
import com.back.project1_team1.product.ProductRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.transaction.annotation.Transactional;

@Configuration
@RequiredArgsConstructor
public class DummyDataInit {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Bean
    @Profile("!prod")
    public CommandLineRunner initData() {
        return new CommandLineRunner() {
            @Override
            @Transactional
            public void run(String... args) {
                if (productRepository.count() > 0) {
                    return;
                }

                // 1. 상품 6종 등록
                Product p1 = new Product("Columbia Quindio", 5000, "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&auto=format&fit=crop&q=60");
                Product p2 = new Product("Ethiopia Sidamo", 5000, "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=300&auto=format&fit=crop&q=60");
                Product p3 = new Product("Brazil Serra Do Caparao", 6000, "https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&auto=format&fit=crop&q=60");
                Product p4 = new Product("Columbia Nariño", 7000, "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=60");
                Product p5 = new Product("Guatemala Antigua", 6500, "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=300&auto=format&fit=crop&q=60");
                Product p6 = new Product("Decaf House Blend", 5500, "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&auto=format&fit=crop&q=60");

                List<Product> products = List.of(p1, p2, p3, p4, p5, p6);
                productRepository.saveAll(products);

                // 2. 기준 시간 설정
                LocalDate today = LocalDate.now();
                LocalDateTime pastDeliveredDate1 = LocalDateTime.of(today.minusDays(2), LocalTime.of(11, 0)); // 2일 전 11:00 (배송 완료)
                LocalDateTime pastDeliveredDate2 = LocalDateTime.of(today.minusDays(1), LocalTime.of(10, 0)); // 1일 전 10:00 (배송 완료)
                LocalDateTime todayAfterCutoff = LocalDateTime.of(today, LocalTime.of(15, 30));             // 오늘 15:30 (배송 준비중)
                LocalDateTime futurePendingDate = LocalDateTime.of(today.plusDays(1), LocalTime.of(9, 30)); // 내일 09:30 (배송 준비중)

                List<Order> ordersToSave = new ArrayList<>();

                // [그룹 1: 배송 완료 그룹 총 50건] (10개 계정 x 각 5건씩)
                for (int userIdx = 1; userIdx <= 10; userIdx++) {
                    String email = "completed.user" + userIdx + "@coffee.com";
                    for (int orderIdx = 1; orderIdx <= 5; orderIdx++) {
                        LocalDateTime orderTime = (orderIdx % 2 == 0) ? pastDeliveredDate1 : pastDeliveredDate2;
                        Product selectedProduct1 = products.get((userIdx + orderIdx) % 6);
                        Product selectedProduct2 = products.get((userIdx + orderIdx + 1) % 6);

                        ordersToSave.add(buildOrder(
                            email,
                            "0603" + (userIdx % 10),
                            "서울시 강남구 테헤란로 " + (100 + userIdx * 5 + orderIdx),
                            orderTime,
                            List.of(selectedProduct1, selectedProduct2),
                            List.of((orderIdx % 3) + 1, 1)
                        ));
                    }
                }

                // [그룹 2: 당일 14시 이후 주문 미완료 그룹 총 40건] (8개 계정 x 각 5건씩)
                for (int userIdx = 1; userIdx <= 8; userIdx++) {
                    String email = "today.pending" + userIdx + "@coffee.com";
                    for (int orderIdx = 1; orderIdx <= 5; orderIdx++) {
                        Product selectedProduct = products.get((userIdx * 2 + orderIdx) % 6);

                        ordersToSave.add(buildOrder(
                            email,
                            "1349" + (userIdx % 10),
                            "경기도 성남시 분당구 판교역로 " + (200 + userIdx * 5 + orderIdx),
                            todayAfterCutoff.plusMinutes(orderIdx * 5),
                            List.of(selectedProduct),
                            List.of(orderIdx % 4 + 1)
                        ));
                    }
                }

                // [그룹 3: 미래/배송 대기 미완료 그룹 총 30건] (6개 계정 x 각 5건씩)
                for (int userIdx = 1; userIdx <= 6; userIdx++) {
                    String email = "future.pending" + userIdx + "@coffee.com";
                    for (int orderIdx = 1; orderIdx <= 5; orderIdx++) {
                        Product selectedProduct1 = products.get((userIdx + orderIdx) % 6);
                        Product selectedProduct2 = products.get((userIdx + orderIdx + 3) % 6);

                        ordersToSave.add(buildOrder(
                            email,
                            "0452" + (userIdx % 10),
                            "서울시 중구 세종대로 " + (300 + userIdx * 5 + orderIdx),
                            futurePendingDate.plusMinutes(orderIdx * 10),
                            List.of(selectedProduct1, selectedProduct2),
                            List.of(1, 2)
                        ));
                    }
                }

                orderRepository.saveAll(ordersToSave);
            }

            private Order buildOrder(String email, String postalCode, String address, LocalDateTime orderDate, List<Product> products, List<Integer> quantities) {
                Order order = new Order(email, postalCode, address, orderDate);
                for (int i = 0; i < products.size(); i++) {
                    order.addOrderItem(products.get(i), quantities.get(i));
                }
                return order;
            }
        };
    }
}