package com.oluuiss.demo_sneakhouse.cart;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.oluuiss.demo_sneakhouse.cart.CartDtos.AddItemRequest;
import com.oluuiss.demo_sneakhouse.cart.CartDtos.CartResponse;
import com.oluuiss.demo_sneakhouse.cart.CartDtos.UpdateItemRequest;
import com.oluuiss.demo_sneakhouse.common.AppLanguage;
import com.oluuiss.demo_sneakhouse.common.AuthenticatedUser;

@RestController
@RequestMapping("/api/cart")
public class CartController {

	private final CartService cartService;

	public CartController(CartService cartService) {
		this.cartService = cartService;
	}

	@GetMapping
	public CartResponse get(AuthenticatedUser user) {
		return cartService.get(user.id(), AppLanguage.current());
	}

	@PostMapping("/items")
	public CartResponse add(AuthenticatedUser user, @Valid @RequestBody AddItemRequest body) {
		return cartService.add(user.id(), body.menuItemId(), body.quantity(), AppLanguage.current());
	}

	@PutMapping("/items/{menuItemId}")
	public CartResponse update(AuthenticatedUser user, @PathVariable Long menuItemId,
			@Valid @RequestBody UpdateItemRequest body) {
		return cartService.update(user.id(), menuItemId, body.quantity(), AppLanguage.current());
	}

	@DeleteMapping("/items/{menuItemId}")
	public CartResponse remove(AuthenticatedUser user, @PathVariable Long menuItemId) {
		return cartService.remove(user.id(), menuItemId, AppLanguage.current());
	}

	@DeleteMapping
	public ResponseEntity<Void> clear(AuthenticatedUser user) {
		cartService.clear(user.id());
		return ResponseEntity.noContent().build();
	}

}
