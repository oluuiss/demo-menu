package com.oluuiss.demo_sneakhouse.cart;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import com.oluuiss.demo_sneakhouse.menu.MenuItem;

/** One line of a user's server-side cart. */
@Entity
@Table(name = "cart_items", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "menu_item_id" }))
public class CartItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "menu_item_id")
	private MenuItem menuItem;

	@Column(nullable = false)
	private int quantity;

	protected CartItem() {
	}

	public CartItem(Long userId, MenuItem menuItem, int quantity) {
		this.userId = userId;
		this.menuItem = menuItem;
		this.quantity = quantity;
	}

	public Long getId() {
		return id;
	}

	public Long getUserId() {
		return userId;
	}

	public MenuItem getMenuItem() {
		return menuItem;
	}

	public int getQuantity() {
		return quantity;
	}

	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}

}
