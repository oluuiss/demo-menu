package com.oluuiss.demo_sneakhouse.order;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.oluuiss.demo_sneakhouse.cart.CartItem;
import com.oluuiss.demo_sneakhouse.cart.CartService;
import com.oluuiss.demo_sneakhouse.cart.PricingService;
import com.oluuiss.demo_sneakhouse.common.ApiException;
import com.oluuiss.demo_sneakhouse.common.AppLanguage;
import com.oluuiss.demo_sneakhouse.common.DeliveryProperties;
import com.oluuiss.demo_sneakhouse.order.OrderDtos.CheckoutRequest;
import com.oluuiss.demo_sneakhouse.order.OrderDtos.OrderLineResponse;
import com.oluuiss.demo_sneakhouse.order.OrderDtos.OrderResponse;
import com.oluuiss.demo_sneakhouse.order.OrderDtos.OrderSummaryResponse;
import com.oluuiss.demo_sneakhouse.order.OrderDtos.Payment;
import com.oluuiss.demo_sneakhouse.order.OrderDtos.TimelineStep;
import com.oluuiss.demo_sneakhouse.payment.MockPaymentService;
import com.oluuiss.demo_sneakhouse.payment.MockPaymentService.CardDetails;
import com.oluuiss.demo_sneakhouse.payment.MockPaymentService.PaymentResult;

@Service
@Transactional
public class OrderService {

	private final OrderRepository orders;
	private final CartService cartService;
	private final PricingService pricing;
	private final MockPaymentService payments;
	private final OrderStatusPolicy statusPolicy;
	private final DeliveryProperties delivery;
	private final Clock clock;

	public OrderService(OrderRepository orders, CartService cartService, PricingService pricing,
			MockPaymentService payments, OrderStatusPolicy statusPolicy, DeliveryProperties delivery, Clock clock) {
		this.orders = orders;
		this.cartService = cartService;
		this.pricing = pricing;
		this.payments = payments;
		this.statusPolicy = statusPolicy;
		this.delivery = delivery;
		this.clock = clock;
	}

	/** Prices the user's cart, charges the mock gateway, creates the order and empties the cart. */
	public OrderResponse checkout(Long userId, CheckoutRequest request, AppLanguage language) {
		List<CartItem> cart = cartService.items(userId);
		if (cart.isEmpty()) {
			throw ApiException.unprocessable("order.emptyCart");
		}
		PricingService.Breakdown totals = pricing.calculate(cart.stream()
				.map(i -> new PricingService.PricedLine(i.getMenuItem().getPrice(), i.getQuantity()))
				.toList());

		PaymentResult payment = payments.charge(totals.total(), new CardDetails(request.cardholderName(),
				request.cardNumber(), request.expiry(), request.cvv()));

		CustomerOrder order = new CustomerOrder(userId, clock.instant(), totals.subtotal(), totals.deliveryFee(),
				totals.total(), delivery.address(), payment.transactionId(), payment.brand(), payment.last4());
		for (CartItem item : cart) {
			order.addLine(new OrderLine(item.getMenuItem(), item.getQuantity(), item.getMenuItem().getPrice(),
					pricing.lineTotal(item.getMenuItem().getPrice(), item.getQuantity())));
		}
		orders.save(order);
		order.assignNumber();
		cartService.clear(userId);
		return toResponse(order, language);
	}

	public List<OrderSummaryResponse> history(Long userId, AppLanguage language) {
		return orders.findByUserIdOrderByPaidAtDesc(userId).stream().map(order -> {
			syncStatus(order);
			return new OrderSummaryResponse(order.getNumber(), order.getPaidAt(), order.getStatus(),
					order.getLines().stream().mapToInt(OrderLine::getQuantity).sum(), order.getTotal(),
					order.getLines().stream().map(l -> l.getMenuItem().text(language).getName()).toList());
		}).toList();
	}

	public OrderResponse get(Long userId, String number, AppLanguage language) {
		CustomerOrder order = orders.findByNumberAndUserId(number, userId)
				.orElseThrow(() -> ApiException.notFound("order.notFound"));
		return toResponse(order, language);
	}

	/** Persists the time-derived status for all open orders (keeps the database in step). */
	public void advanceOpenOrders() {
		orders.findByStatusNot(OrderStatus.DELIVERED).forEach(this::syncStatus);
	}

	private void syncStatus(CustomerOrder order) {
		OrderStatus effective = statusPolicy.statusAt(order.getPaidAt(), clock.instant());
		if (effective != order.getStatus()) {
			order.setStatus(effective);
		}
	}

	private OrderResponse toResponse(CustomerOrder order, AppLanguage language) {
		syncStatus(order);
		Instant now = clock.instant();
		Map<OrderStatus, Instant> schedule = statusPolicy.schedule(order.getPaidAt());
		List<TimelineStep> timeline = schedule.entrySet().stream().map(step -> {
			int cmp = step.getKey().compareTo(order.getStatus());
			String state = cmp < 0 || order.getStatus() == OrderStatus.DELIVERED ? "DONE"
					: cmp == 0 ? "CURRENT" : "UPCOMING";
			return new TimelineStep(step.getKey(), step.getValue(), state);
		}).toList();
		List<OrderLineResponse> items = order.getLines().stream()
				.map(l -> new OrderLineResponse(l.getMenuItem().getId(), l.getMenuItem().text(language).getName(),
						l.getMenuItem().getImageUrl(), l.getQuantity(), l.getUnitPrice(), l.getLineTotal()))
				.toList();
		return new OrderResponse(order.getNumber(), order.getPaidAt(), order.getStatus(), items,
				items.stream().mapToInt(OrderLineResponse::quantity).sum(), order.getSubtotal(),
				order.getDeliveryFee(), order.getTotal(), order.getDeliveryAddress(),
				new Payment(order.getCardBrand(), order.getCardLast4(), order.getPaymentTransactionId()), timeline,
				statusPolicy.nextTransitionAt(order.getPaidAt(), now), schedule.get(OrderStatus.DELIVERED), now);
	}

}
