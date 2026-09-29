package com.oluuiss.demo_sneakhouse.menu;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.Table;

import com.oluuiss.demo_sneakhouse.common.AppLanguage;

@Entity
@Table(name = "menu_items")
public class MenuItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/** Stable business key used by the seed data. */
	@Column(nullable = false, unique = true, length = 60)
	private String code;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private MenuCategory category;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal price;

	@Column(name = "image_url", length = 500)
	private String imageUrl;

	private boolean featured;

	/** Translations keyed by language code (pt, en, de). */
	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "menu_item_texts", joinColumns = @JoinColumn(name = "menu_item_id"))
	@MapKeyColumn(name = "language", length = 5)
	private Map<String, MenuItemText> texts = new HashMap<>();

	protected MenuItem() {
	}

	public MenuItem(String code, MenuCategory category, BigDecimal price, String imageUrl, boolean featured,
			Map<String, MenuItemText> texts) {
		this.code = code;
		this.category = category;
		this.price = price;
		this.imageUrl = imageUrl;
		this.featured = featured;
		this.texts.putAll(texts);
	}

	/** Text in the requested language, falling back to Portuguese. */
	public MenuItemText text(AppLanguage language) {
		MenuItemText text = texts.get(language.code());
		return text != null ? text : texts.get(AppLanguage.PT.code());
	}

	public Long getId() {
		return id;
	}

	public String getCode() {
		return code;
	}

	public MenuCategory getCategory() {
		return category;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public boolean isFeatured() {
		return featured;
	}

}
