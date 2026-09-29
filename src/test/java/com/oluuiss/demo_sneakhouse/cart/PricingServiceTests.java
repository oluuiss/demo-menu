package com.oluuiss.demo_sneakhouse.cart;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.oluuiss.demo_sneakhouse.cart.PricingService.PricedLine;

class PricingServiceTests {

	private final PricingService pricing = new PricingService(
			new PricingProperties(new BigDecimal("9.90"), new BigDecimal("150.00"), 20));

	@Test
	void chargesDeliveryBelowThreshold() {
		var result = pricing.calculate(List.of(new PricedLine(new BigDecimal("59.90"), 2)));
		assertThat(result.subtotal()).isEqualByComparingTo("119.80");
		assertThat(result.deliveryFee()).isEqualByComparingTo("9.90");
		assertThat(result.total()).isEqualByComparingTo("129.70");
		assertThat(result.itemCount()).isEqualTo(2);
		assertThat(result.remainingForFreeDelivery()).isEqualByComparingTo("30.20");
	}

	@Test
	void deliveryIsFreeFromThreshold() {
		var result = pricing.calculate(List.of(new PricedLine(new BigDecimal("112.90"), 1),
				new PricedLine(new BigDecimal("39.90"), 1)));
		assertThat(result.subtotal()).isEqualByComparingTo("152.80");
		assertThat(result.deliveryFee()).isEqualByComparingTo("0.00");
		assertThat(result.total()).isEqualByComparingTo("152.80");
	}

	@Test
	void emptyCartCostsNothing() {
		var result = pricing.calculate(List.of());
		assertThat(result.total()).isEqualByComparingTo("0.00");
		assertThat(result.deliveryFee()).isEqualByComparingTo("0.00");
	}

}
