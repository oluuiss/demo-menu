package com.oluuiss.demo_sneakhouse.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * When the React build is bundled into the jar (src/main/resources/static), forward the
 * client-side routes to index.html so refreshing any page works.
 */
@Controller
public class SpaForwardController {

	@GetMapping({ "/menu", "/restaurants", "/reserve", "/cart", "/checkout", "/orders", "/orders/{number}",
			"/settings", "/login", "/forgot-password" })
	public String forward() {
		return "forward:/index.html";
	}

}
