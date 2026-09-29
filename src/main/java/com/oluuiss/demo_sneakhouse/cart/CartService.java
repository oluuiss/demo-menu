package com.oluuiss.demo_sneakhouse.cart;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.oluuiss.demo_sneakhouse.cart.CartDtos.CartLine;
import com.oluuiss.demo_sneakhouse.cart.CartDtos.CartResponse;
import com.oluuiss.demo_sneakhouse.common.ApiException;
import com.oluuiss.demo_sneakhouse.common.AppLanguage;
import com.oluuiss.demo_sneakhouse.common.DeliveryProperties;
import com.oluuiss.demo_sneakhouse.menu.MenuItem;
import com.oluuiss.demo_sneakhouse.menu.MenuService;

@Service
@Transactional
public class CartService {

	private final CartItemRepository cartItems;
	private final MenuService menuService;
	private final PricingService pricing;
	private final DeliveryProperties delivery;

	public CartService(CartItemRepository cartItems, MenuService menuService, PricingService pricing,
			DeliveryProperties delivery) {
		this.cartItems = cartItems;
		this.menuService = menuService;
		this.pricing = pricing;
		this.delivery = delivery;
	}

	@Transactional(readOnly = true)
	public CartResponse get(Long userId, AppLanguage language) {
		return toResponse(items(userId), language);
	}

	/** Adds to the existing quantity of the item (or creates the line). */
	public CartResponse add(Long userId, Long menuItemId, int quantity, AppLanguage language) {
		MenuItem menuItem = menuService.require(menuItemId);
		CartItem line = cartItems.findByUserIdAndMenuItemId(userId, menuItemId)
				.orElseGet(() -> new CartItem(userId, menuItem, 0));
		line.setQuantity(checkedQuantity(line.getQuantity() + quantity));
		cartItems.save(line);
		return get(userId, language);
	}

	/** Sets the quantity; 0 removes the line. */
	public CartResponse update(Long userId, Long menuItemId, int quantity, AppLanguage language) {
		CartItem line = cartItems.findByUserIdAndMenuItemId(userId, menuItemId)
				.orElseThrow(() -> ApiException.notFound("cart.itemNotFound"));
		if (quantity == 0) {
			cartItems.delete(line);
		}
		else {
			line.setQuantity(checkedQuantity(quantity));
		}
		return get(userId, language);
	}

	public CartResponse remove(Long userId, Long menuItemId, AppLanguage language) {
		cartItems.findByUserIdAndMenuItemId(userId, menuItemId).ifPresent(cartItems::delete);
		return get(userId, language);
	}

	public void clear(Long userId) {
		cartItems.deleteByUserId(userId);
	}

	@Transactional(readOnly = true)
	public List<CartItem> items(Long userId) {
		return cartItems.findByUserIdOrderByIdAsc(userId);
	}

	private int checkedQuantity(int quantity) {
		int max = pricing.maxQuantityPerItem();
		if (quantity > max) {
			throw ApiException.unprocessable("cart.maxQuantity", max);
		}
		return quantity;
	}

	private CartResponse toResponse(List<CartItem> items, AppLanguage language) {
		List<CartLine> lines = items.stream().map(item -> {
			MenuItem menuItem = item.getMenuItem();
			return new CartLine(menuItem.getId(), menuItem.text(language).getName(), menuItem.getImageUrl(),
					menuItem.getPrice(), item.getQuantity(), pricing.lineTotal(menuItem.getPrice(), item.getQuantity()));
		}).toList();
		PricingService.Breakdown totals = pricing.calculate(
				lines.stream().map(l -> new PricingService.PricedLine(l.unitPrice(), l.quantity())).toList());
		return new CartResponse(lines, totals.itemCount(), totals.subtotal(), totals.deliveryFee(), totals.total(),
				totals.freeDeliveryThreshold(), totals.remainingForFreeDelivery(), pricing.maxQuantityPerItem(),
				delivery.address());
	}

}
