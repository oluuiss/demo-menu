package com.oluuiss.demo_sneakhouse.menu;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

	boolean existsByCode(String code);

	List<MenuItem> findByFeaturedTrue();

}
