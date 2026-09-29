package com.oluuiss.demo_sneakhouse.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

@Entity
@Table(name = "orders")
public class CustomerOrder {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/** Public order number, e.g. BG-001042. */
	@Column(unique = true, length = 20)
	private String number;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "paid_at", nullable = false)
	private Instant paidAt;

	/** Last persisted status; the effective status is always derived from {@link OrderStatusPolicy}. */
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private OrderStatus status;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal subtotal;

	@Column(name = "delivery_fee", nullable = false, precision = 10, scale = 2)
	private BigDecimal deliveryFee;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal total;

	@Column(name = "delivery_address", nullable = false)
	private String deliveryAddress;

	@Column(name = "payment_transaction_id", nullable = false, length = 40)
	private String paymentTransactionId;

	@Column(name = "card_brand", length = 20)
	private String cardBrand;

	@Column(name = "card_last4", length = 4)
	private String cardLast4;

	@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
	@OrderBy("id ASC")
	private List<OrderLine> lines = new ArrayList<>();

	protected CustomerOrder() {
	}

	public CustomerOrder(Long userId, Instant paidAt, BigDecimal subtotal, BigDecimal deliveryFee, BigDecimal total,
			String deliveryAddress, String paymentTransactionId, String cardBrand, String cardLast4) {
		this.userId = userId;
		this.paidAt = paidAt;
		this.status = OrderStatus.AWAITING_CONFIRMATION;
		this.subtotal = subtotal;
		this.deliveryFee = deliveryFee;
		this.total = total;
		this.deliveryAddress = deliveryAddress;
		this.paymentTransactionId = paymentTransactionId;
		this.cardBrand = cardBrand;
		this.cardLast4 = cardLast4;
	}

	public void addLine(OrderLine line) {
		line.attachTo(this);
		lines.add(line);
	}

	public void assignNumber() {
		this.number = String.format("BG-%06d", 1000 + id);
	}

	public void setStatus(OrderStatus status) {
		this.status = status;
	}

	public Long getId() {
		return id;
	}

	public String getNumber() {
		return number;
	}

	public Long getUserId() {
		return userId;
	}

	public Instant getPaidAt() {
		return paidAt;
	}

	public OrderStatus getStatus() {
		return status;
	}

	public BigDecimal getSubtotal() {
		return subtotal;
	}

	public BigDecimal getDeliveryFee() {
		return deliveryFee;
	}

	public BigDecimal getTotal() {
		return total;
	}

	public String getDeliveryAddress() {
		return deliveryAddress;
	}

	public String getPaymentTransactionId() {
		return paymentTransactionId;
	}

	public String getCardBrand() {
		return cardBrand;
	}

	public String getCardLast4() {
		return cardLast4;
	}

	public List<OrderLine> getLines() {
		return lines;
	}

}
