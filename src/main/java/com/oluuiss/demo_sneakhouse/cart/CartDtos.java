package com.oluuiss.demo_sneakhouse.cart;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public final class CartDtos {

	private CartDtos() {
	}

	public record AddItemRequest(
			@NotNull Long menuItemId,
			@NotNull @Min(value = 1, message = "{validation.quantity.min}") @Max(value = 99, message = "{validation.quantity.max}") Integer quantity) {
	}

	public record UpdateItemRequest(
			@NotNull @Min(value = 0, message = "{validation.quantity.min}") @Max(value = 99, message = "{validation.quantity.max}") Integer quantity) {
	}

	public record CartLine(Long menuItemId, String name, String imageUrl, BigDecimal unitPrice, int quantity,
			BigDecimal lineTotal) {
	}

	public record CartResponse(List<CartLine> items, int itemCount, BigDecimal subtotal, BigDecimal deliveryFee,
			BigDecimal total, BigDecimal freeDeliveryThreshold, BigDecimal remainingForFreeDelivery,
			int maxQuantityPerItem, String deliveryAddress) {
	}

}
