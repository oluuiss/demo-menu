package com.oluuiss.demo_sneakhouse.order;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.oluuiss.demo_sneakhouse.menu.MenuItem;

/** An ordered item. Price is a snapshot taken at checkout; the name is localized on read. */
@Entity
@Table(name = "order_lines")
public class OrderLine {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "order_id")
	private CustomerOrder order;

	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "menu_item_id")
	private MenuItem menuItem;

	@Column(nullable = false)
	private int quantity;

	@Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
	private BigDecimal unitPrice;

	@Column(name = "line_total", nullable = false, precision = 10, scale = 2)
	private BigDecimal lineTotal;

	protected OrderLine() {
	}

	public OrderLine(MenuItem menuItem, int quantity, BigDecimal unitPrice, BigDecimal lineTotal) {
		this.menuItem = menuItem;
		this.quantity = quantity;
		this.unitPrice = unitPrice;
		this.lineTotal = lineTotal;
	}

	void attachTo(CustomerOrder order) {
		this.order = order;
	}

	public MenuItem getMenuItem() {
		return menuItem;
	}

	public int getQuantity() {
		return quantity;
	}

	public BigDecimal getUnitPrice() {
		return unitPrice;
	}

	public BigDecimal getLineTotal() {
		return lineTotal;
	}

}
