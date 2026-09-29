package com.oluuiss.demo_sneakhouse.reservation;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DiningTableRepository extends JpaRepository<DiningTable, Long> {

	boolean existsByCode(String code);

	List<DiningTable> findAllByOrderByCodeAsc();

}
