package com.oluuiss.demo_sneakhouse.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import jakarta.validation.constraints.NotBlank;

public final class OrderDtos {

	private OrderDtos() {
	}

	public record CheckoutRequest(
			@NotBlank(message = "{validation.card.holder}") String cardholderName,
			@NotBlank(message = "{validation.card.number}") String cardNumber,
			@NotBlank(message = "{validation.card.expiry}") String expiry,
			@NotBlank(message = "{validation.card.cvv}") String cvv) {
	}

	public record OrderLineResponse(Long menuItemId, String name, String imageUrl, int quantity, BigDecimal unitPrice,
			BigDecimal lineTotal) {
	}

	/** One step of the tracking timeline. state is DONE, CURRENT or UPCOMING. */
	public record TimelineStep(OrderStatus status, Instant startsAt, String state) {
	}

	public record Payment(String brand, String last4, String transactionId) {
	}

	public record OrderResponse(String number, Instant paidAt, OrderStatus status, List<OrderLineResponse> items,
			int itemCount, BigDecimal subtotal, BigDecimal deliveryFee, BigDecimal total, String deliveryAddress,
			Payment payment, List<TimelineStep> timeline, Instant nextStatusAt, Instant estimatedDeliveryAt,
			Instant serverTime) {
	}

	public record OrderSummaryResponse(String number, Instant paidAt, OrderStatus status, int itemCount,
			BigDecimal total, List<String> itemNames) {
	}

}
