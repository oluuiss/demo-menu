package com.oluuiss.demo_sneakhouse.menu;

import java.math.BigDecimal;

import com.oluuiss.demo_sneakhouse.common.AppLanguage;

public record MenuItemResponse(
		Long id,
		String code,
		MenuCategory category,
		String name,
		String description,
		BigDecimal price,
		String imageUrl,
		boolean featured) {

	public static MenuItemResponse from(MenuItem item, AppLanguage language) {
		MenuItemText text = item.text(language);
		return new MenuItemResponse(item.getId(), item.getCode(), item.getCategory(), text.getName(),
				text.getDescription(), item.getPrice(), item.getImageUrl(), item.isFeatured());
	}

}
