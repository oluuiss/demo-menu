package com.oluuiss.demo_sneakhouse.cart;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.oluuiss.demo_sneakhouse.common.Money;

/** All price calculations (line totals, subtotal, delivery fee, total) live here. */
@Service
public class PricingService {

	private final PricingProperties properties;

	public PricingService(PricingProperties properties) {
		this.properties = properties;
	}

	public record PricedLine(BigDecimal unitPrice, int quantity) {
	}

	public record Breakdown(BigDecimal subtotal, BigDecimal deliveryFee, BigDecimal total, int itemCount,
			BigDecimal freeDeliveryThreshold, BigDecimal remainingForFreeDelivery) {
	}

	public BigDecimal lineTotal(BigDecimal unitPrice, int quantity) {
		return Money.of(unitPrice.multiply(BigDecimal.valueOf(quantity)));
	}

	public Breakdown calculate(List<PricedLine> lines) {
		BigDecimal subtotal = Money.zero();
		int itemCount = 0;
		for (PricedLine line : lines) {
			subtotal = subtotal.add(lineTotal(line.unitPrice(), line.quantity()));
			itemCount += line.quantity();
		}
		BigDecimal threshold = Money.of(properties.freeDeliveryThreshold());
		boolean empty = itemCount == 0;
		boolean freeDelivery = subtotal.compareTo(threshold) >= 0;
		BigDecimal deliveryFee = empty || freeDelivery ? Money.zero() : Money.of(properties.deliveryFee());
		BigDecimal remaining = freeDelivery ? Money.zero() : Money.of(threshold.subtract(subtotal));
		return new Breakdown(subtotal, deliveryFee, Money.of(subtotal.add(deliveryFee)), itemCount, threshold,
				remaining);
	}

	public int maxQuantityPerItem() {
		return properties.maxQuantityPerItem();
	}

}
