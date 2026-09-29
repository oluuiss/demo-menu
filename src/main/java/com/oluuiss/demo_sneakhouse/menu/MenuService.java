package com.oluuiss.demo_sneakhouse.menu;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.oluuiss.demo_sneakhouse.common.ApiException;
import com.oluuiss.demo_sneakhouse.common.AppLanguage;

@Service
@Transactional(readOnly = true)
public class MenuService {

	private final MenuItemRepository menuItems;

	public MenuService(MenuItemRepository menuItems) {
		this.menuItems = menuItems;
	}

	public List<MenuItemResponse> list(boolean featuredOnly, AppLanguage language) {
		List<MenuItem> items = featuredOnly ? menuItems.findByFeaturedTrue() : menuItems.findAll();
		return items.stream()
				.map(item -> MenuItemResponse.from(item, language))
				.sorted(Comparator.comparing(MenuItemResponse::category).thenComparing(MenuItemResponse::name))
				.toList();
	}

	public MenuItemResponse get(Long id, AppLanguage language) {
		return MenuItemResponse.from(require(id), language);
	}

	public MenuItem require(Long id) {
		return menuItems.findById(id).orElseThrow(() -> ApiException.notFound("menu.itemNotFound"));
	}

}
