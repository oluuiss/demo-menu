package com.oluuiss.demo_sneakhouse.order;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Periodically persists status changes of open orders, so the database mirrors their real state. */
@Component
public class OrderStatusScheduler {

	private final OrderService orderService;

	public OrderStatusScheduler(OrderService orderService) {
		this.orderService = orderService;
	}

	@Scheduled(fixedDelayString = "${app.orders.sync-interval:5s}")
	public void advance() {
		orderService.advanceOpenOrders();
	}

}
