package com.oluuiss.demo_sneakhouse.order;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;

import com.fasterxml.jackson.databind.JsonNode;
import com.oluuiss.demo_sneakhouse.ApiTestSupport;

/** Menu → cart → mock payment → order tracking, through the real API. */
class CheckoutFlowTests extends ApiTestSupport {

	private static final String VALID_CARD = "{\"cardholderName\":\"Luis Porto\",\"cardNumber\":\"4242 4242 4242 4242\",\"expiry\":\"12/39\",\"cvv\":\"123\"}";

	private MockHttpSession session;

	@BeforeEach
	void setUp() throws Exception {
		session = login();
		mvc.perform(delete("/api/cart").session(session)).andExpect(status().isNoContent());
	}

	@Test
	void menuIsTranslatedByAcceptLanguage() throws Exception {
		JsonNode en = read(mvc.perform(get("/api/menu").header(HttpHeaders.ACCEPT_LANGUAGE, "en")));
		JsonNode de = read(mvc.perform(get("/api/menu").header(HttpHeaders.ACCEPT_LANGUAGE, "de")));
		assertThat(en.size()).isGreaterThanOrEqualTo(25);
		assertThat(en.findValuesAsText("name")).contains("Slow-Fire Ribs");
		assertThat(de.findValuesAsText("name")).contains("Spareribs vom langsamen Feuer");
	}

	@Test
	void cartTotalsAreCalculatedByTheBackend() throws Exception {
		long ribsId = menuItemId("SLOW_RIBS"); // 98.90
		addToCart(ribsId, 1);
		mvc.perform(get("/api/cart").session(session))
				.andExpect(jsonPath("$.subtotal").value(98.90))
				.andExpect(jsonPath("$.deliveryFee").value(9.90))
				.andExpect(jsonPath("$.total").value(108.80));

		mvc.perform(put("/api/cart/items/" + ribsId).session(session).contentType(MediaType.APPLICATION_JSON)
				.content("{\"quantity\":2}"))
				.andExpect(jsonPath("$.items[0].quantity").value(2))
				.andExpect(jsonPath("$.subtotal").value(197.80))
				.andExpect(jsonPath("$.deliveryFee").value(0.00))
				.andExpect(jsonPath("$.total").value(197.80));
	}

	@Test
	void checkoutCreatesOrderEmptiesCartAndTracksStatus() throws Exception {
		addToCart(menuItemId("LAVA_BROWNIE"), 2); // 2 x 39.90

		JsonNode order = read(mvc.perform(post("/api/orders/checkout").session(session)
				.contentType(MediaType.APPLICATION_JSON).content(VALID_CARD))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.status").value("AWAITING_CONFIRMATION"))
				.andExpect(jsonPath("$.total").value(89.70))
				.andExpect(jsonPath("$.payment.last4").value("4242"))
				.andExpect(jsonPath("$.timeline.length()").value(4)));
		String number = order.get("number").asText();
		assertThat(number).startsWith("BG-");

		mvc.perform(get("/api/cart").session(session)).andExpect(jsonPath("$.itemCount").value(0));
		mvc.perform(get("/api/orders/" + number).session(session))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.items[0].quantity").value(2))
				.andExpect(jsonPath("$.deliveryAddress").value("São Paulo - SP"));
		mvc.perform(get("/api/orders").session(session))
				.andExpect(jsonPath("$[0].number").value(number));
	}

	@Test
	void declinedAndInvalidCardsDoNotCreateOrders() throws Exception {
		addToCart(menuItemId("HOUSE_LEMONADE"), 1);
		mvc.perform(post("/api/orders/checkout").session(session).contentType(MediaType.APPLICATION_JSON)
				.content(VALID_CARD.replace("4242 4242 4242 4242", "4000 0000 0000 0002")))
				.andExpect(status().isPaymentRequired())
				.andExpect(jsonPath("$.code").value("payment.declined"));
		mvc.perform(post("/api/orders/checkout").session(session).contentType(MediaType.APPLICATION_JSON)
				.content(VALID_CARD.replace("4242 4242 4242 4242", "1234 5678 9012 3456")))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(jsonPath("$.code").value("payment.invalidCard"));
		mvc.perform(get("/api/cart").session(session)).andExpect(jsonPath("$.itemCount").value(1));
	}

	@Test
	void emptyCartCannotBeCheckedOut() throws Exception {
		mvc.perform(post("/api/orders/checkout").session(session).contentType(MediaType.APPLICATION_JSON)
				.content(VALID_CARD))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(jsonPath("$.code").value("order.emptyCart"));
	}

	private void addToCart(long menuItemId, int quantity) throws Exception {
		mvc.perform(post("/api/cart/items").session(session).contentType(MediaType.APPLICATION_JSON)
				.content("{\"menuItemId\":" + menuItemId + ",\"quantity\":" + quantity + "}"))
				.andExpect(status().isOk());
	}

	private long menuItemId(String code) throws Exception {
		for (JsonNode item : read(mvc.perform(get("/api/menu")))) {
			if (code.equals(item.get("code").asText())) {
				return item.get("id").asLong();
			}
		}
		throw new AssertionError("Menu item not seeded: " + code);
	}

}
