package com.oluuiss.demo_sneakhouse.order;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {

	List<CustomerOrder> findByUserIdOrderByPaidAtDesc(Long userId);

	Optional<CustomerOrder> findByNumberAndUserId(String number, Long userId);

	List<CustomerOrder> findByStatusNot(OrderStatus status);

}
