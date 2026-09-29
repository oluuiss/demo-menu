package com.oluuiss.demo_sneakhouse.menu;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.oluuiss.demo_sneakhouse.common.AppLanguage;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

	private final MenuService menuService;

	public MenuController(MenuService menuService) {
		this.menuService = menuService;
	}

	@GetMapping
	public List<MenuItemResponse> list(@RequestParam(defaultValue = "false") boolean featured) {
		return menuService.list(featured, AppLanguage.current());
	}

	@GetMapping("/{id}")
	public MenuItemResponse get(@PathVariable Long id) {
		return menuService.get(id, AppLanguage.current());
	}

}
