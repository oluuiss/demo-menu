package com.oluuiss.demo_sneakhouse.order;

import java.time.Duration;
import java.time.Instant;
import java.util.EnumMap;
import java.util.Map;

import org.springframework.stereotype.Component;

/**
 * Status transitions are driven by the time elapsed since payment:
 * AWAITING_CONFIRMATION (10s) → PREPARING (5 min) → OUT_FOR_DELIVERY (5 min) → DELIVERED.
 * Being a pure function of time, it survives restarts and needs no background job to be correct.
 */
@Component
public class OrderStatusPolicy {

	private final OrderTimingProperties timings;

	public OrderStatusPolicy(OrderTimingProperties timings) {
		this.timings = timings;
	}

	/** Moment each status starts for an order paid at {@code paidAt}. */
	public Map<OrderStatus, Instant> schedule(Instant paidAt) {
		Map<OrderStatus, Instant> starts = new EnumMap<>(OrderStatus.class);
		Instant t = paidAt;
		starts.put(OrderStatus.AWAITING_CONFIRMATION, t);
		t = t.plus(timings.awaitingConfirmation());
		starts.put(OrderStatus.PREPARING, t);
		t = t.plus(timings.preparing());
		starts.put(OrderStatus.OUT_FOR_DELIVERY, t);
		t = t.plus(timings.outForDelivery());
		starts.put(OrderStatus.DELIVERED, t);
		return starts;
	}

	public OrderStatus statusAt(Instant paidAt, Instant now) {
		OrderStatus current = OrderStatus.AWAITING_CONFIRMATION;
		for (Map.Entry<OrderStatus, Instant> step : schedule(paidAt).entrySet()) {
			if (!now.isBefore(step.getValue())) {
				current = step.getKey();
			}
		}
		return current;
	}

	/** When the next status begins, or null once delivered. */
	public Instant nextTransitionAt(Instant paidAt, Instant now) {
		OrderStatus current = statusAt(paidAt, now);
		if (current == OrderStatus.DELIVERED) {
			return null;
		}
		return schedule(paidAt).get(OrderStatus.values()[current.ordinal() + 1]);
	}

	public Duration totalDuration() {
		return timings.awaitingConfirmation().plus(timings.preparing()).plus(timings.outForDelivery());
	}

}
