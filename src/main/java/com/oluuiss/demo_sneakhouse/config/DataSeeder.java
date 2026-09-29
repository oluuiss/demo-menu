package com.oluuiss.demo_sneakhouse.config;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oluuiss.demo_sneakhouse.menu.MenuCategory;
import com.oluuiss.demo_sneakhouse.menu.MenuItem;
import com.oluuiss.demo_sneakhouse.menu.MenuItemRepository;
import com.oluuiss.demo_sneakhouse.menu.MenuItemText;
import com.oluuiss.demo_sneakhouse.reservation.DiningTable;
import com.oluuiss.demo_sneakhouse.reservation.DiningTableRepository;
import com.oluuiss.demo_sneakhouse.user.AppUser;
import com.oluuiss.demo_sneakhouse.user.IdentityDocument;
import com.oluuiss.demo_sneakhouse.user.UserRepository;

/**
 * Seeds the local database on startup so the project works right after cloning: the single demo
 * account (with its read-only demo profile), the menu (seed/menu.json) and the floor plan
 * (seed/tables.json). Idempotent: rows are matched by their business key.
 */
@Component
public class DataSeeder implements CommandLineRunner {

	private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

	private final UserRepository users;
	private final MenuItemRepository menuItems;
	private final DiningTableRepository tables;
	private final PasswordEncoder passwordEncoder;
	private final ObjectMapper objectMapper;
	private final String demoEmail;
	private final String demoPassword;

	public DataSeeder(UserRepository users, MenuItemRepository menuItems, DiningTableRepository tables,
			PasswordEncoder passwordEncoder, ObjectMapper objectMapper,
			@Value("${app.demo-user.email}") String demoEmail,
			@Value("${app.demo-user.password}") String demoPassword) {
		this.users = users;
		this.menuItems = menuItems;
		this.tables = tables;
		this.passwordEncoder = passwordEncoder;
		this.objectMapper = objectMapper;
		this.demoEmail = demoEmail;
		this.demoPassword = demoPassword;
	}

	@Override
	@Transactional
	public void run(String... args) throws IOException {
		seedDemoUser();
		seedMenu();
		seedTables();
	}

	private void seedDemoUser() {
		AppUser user = users.findByEmailIgnoreCase(demoEmail).orElseGet(() -> {
			log.info("Seeded demo user {}", demoEmail);
			return new AppUser(demoEmail, "Lucas Andrade", passwordEncoder.encode(demoPassword));
		});
		// Fictional demo data. The document numbers are well-known specimen/test values.
		user.updateProfile("Lucas Andrade", "+55 11 94784-9239", LocalDate.of(1996, 3, 14), "/images/gatinho.jpeg",
				Map.of("BR", new IdentityDocument("CPF", "123.456.789-09"),
						"US", new IdentityDocument("SSN", "123-45-6789"),
						"DE", new IdentityDocument("PERSONALAUSWEIS", "T22000129")));
		users.save(user);
	}

	record TextSeed(String name, String description) {
	}

	record MenuSeed(String code, MenuCategory category, BigDecimal price, String image, boolean featured,
			Map<String, TextSeed> texts) {
	}

	private void seedMenu() throws IOException {
		int added = 0;
		for (MenuSeed seed : read("seed/menu.json", new TypeReference<List<MenuSeed>>() {
		})) {
			if (menuItems.existsByCode(seed.code())) {
				continue;
			}
			Map<String, MenuItemText> texts = new HashMap<>();
			seed.texts().forEach((lang, t) -> texts.put(lang, new MenuItemText(t.name(), t.description())));
			String imageUrl = "https://images.unsplash.com/" + seed.image() + "?auto=format&fit=crop&w=800&q=70";
			menuItems.save(new MenuItem(seed.code(), seed.category(), seed.price(), imageUrl, seed.featured(), texts));
			added++;
		}
		if (added > 0) {
			log.info("Seeded {} menu items", added);
		}
	}

	record TableSeed(String code, int seats, DiningTable.Shape shape, DiningTable.Zone zone, int x, int y,
			int width, int height) {
	}

	private void seedTables() throws IOException {
		int added = 0;
		for (TableSeed seed : read("seed/tables.json", new TypeReference<List<TableSeed>>() {
		})) {
			if (!tables.existsByCode(seed.code())) {
				tables.save(new DiningTable(seed.code(), seed.seats(), seed.shape(), seed.zone(), seed.x(), seed.y(),
						seed.width(), seed.height()));
				added++;
			}
		}
		if (added > 0) {
			log.info("Seeded {} dining tables", added);
		}
	}

	private <T> T read(String path, TypeReference<T> type) throws IOException {
		try (InputStream in = new ClassPathResource(path).getInputStream()) {
			return objectMapper.readValue(in, type);
		}
	}

}
