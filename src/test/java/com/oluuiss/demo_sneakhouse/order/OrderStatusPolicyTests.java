package com.oluuiss.demo_sneakhouse.order;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.Instant;

import org.junit.jupiter.api.Test;

class OrderStatusPolicyTests {

	private final OrderStatusPolicy policy = new OrderStatusPolicy(new OrderTimingProperties(Duration.ofSeconds(10),
			Duration.ofMinutes(5), Duration.ofMinutes(5)));

	private final Instant paid = Instant.parse("2026-09-29T20:00:00Z");

	@Test
	void progressesThroughStatusesByElapsedTime() {
		assertThat(policy.statusAt(paid, paid)).isEqualTo(OrderStatus.AWAITING_CONFIRMATION);
		assertThat(policy.statusAt(paid, paid.plusSeconds(9))).isEqualTo(OrderStatus.AWAITING_CONFIRMATION);
		assertThat(policy.statusAt(paid, paid.plusSeconds(10))).isEqualTo(OrderStatus.PREPARING);
		assertThat(policy.statusAt(paid, paid.plusSeconds(10 + 299))).isEqualTo(OrderStatus.PREPARING);
		assertThat(policy.statusAt(paid, paid.plusSeconds(10 + 300))).isEqualTo(OrderStatus.OUT_FOR_DELIVERY);
		assertThat(policy.statusAt(paid, paid.plusSeconds(10 + 600))).isEqualTo(OrderStatus.DELIVERED);
		assertThat(policy.statusAt(paid, paid.plusSeconds(86_400))).isEqualTo(OrderStatus.DELIVERED);
	}

	@Test
	void nextTransitionIsTheStartOfTheFollowingStatus() {
		assertThat(policy.nextTransitionAt(paid, paid.plusSeconds(3))).isEqualTo(paid.plusSeconds(10));
		assertThat(policy.nextTransitionAt(paid, paid.plusSeconds(60))).isEqualTo(paid.plusSeconds(310));
		assertThat(policy.nextTransitionAt(paid, paid.plusSeconds(10_000))).isNull();
	}

}
