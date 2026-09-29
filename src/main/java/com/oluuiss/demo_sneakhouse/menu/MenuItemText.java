package com.oluuiss.demo_sneakhouse.menu;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/** Name and description of a menu item in one language. */
@Embeddable
public class MenuItemText {

	@Column(nullable = false)
	private String name;

	@Column(nullable = false, length = 500)
	private String description;

	protected MenuItemText() {
	}

	public MenuItemText(String name, String description) {
		this.name = name;
		this.description = description;
	}

	public String getName() {
		return name;
	}

	public String getDescription() {
		return description;
	}

}
