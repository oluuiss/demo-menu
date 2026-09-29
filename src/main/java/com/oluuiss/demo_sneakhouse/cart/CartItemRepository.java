package com.oluuiss.demo_sneakhouse.cart;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

	List<CartItem> findByUserIdOrderByIdAsc(Long userId);

	Optional<CartItem> findByUserIdAndMenuItemId(Long userId, Long menuItemId);

	void deleteByUserId(Long userId);

}
