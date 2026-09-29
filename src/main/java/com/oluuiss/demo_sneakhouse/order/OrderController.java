package com.oluuiss.demo_sneakhouse.order;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.oluuiss.demo_sneakhouse.common.AppLanguage;
import com.oluuiss.demo_sneakhouse.common.AuthenticatedUser;
import com.oluuiss.demo_sneakhouse.order.OrderDtos.CheckoutRequest;
import com.oluuiss.demo_sneakhouse.order.OrderDtos.OrderResponse;
import com.oluuiss.demo_sneakhouse.order.OrderDtos.OrderSummaryResponse;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

	private final OrderService orderService;

	public OrderController(OrderService orderService) {
		this.orderService = orderService;
	}

	/** Pays for the current cart with the mock gateway and creates the order. */
	@PostMapping("/checkout")
	@ResponseStatus(HttpStatus.CREATED)
	public OrderResponse checkout(AuthenticatedUser user, @Valid @RequestBody CheckoutRequest body) {
		return orderService.checkout(user.id(), body, AppLanguage.current());
	}

	@GetMapping
	public List<OrderSummaryResponse> history(AuthenticatedUser user) {
		return orderService.history(user.id(), AppLanguage.current());
	}

	@GetMapping("/{number}")
	public OrderResponse get(AuthenticatedUser user, @PathVariable String number) {
		return orderService.get(user.id(), number, AppLanguage.current());
	}

}
