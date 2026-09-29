package com.oluuiss.demo_sneakhouse.reservation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;

import com.fasterxml.jackson.databind.JsonNode;
import com.oluuiss.demo_sneakhouse.ApiTestSupport;

class ReservationFlowTests extends ApiTestSupport {

	private final String date = LocalDate.now().plusDays(2).toString();

	@Test
	void optionsExposeRestaurantSlotsAndTableSizes() throws Exception {
		mvc.perform(get("/api/reservations/options"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.restaurant.phone").value("+55 11 94784-9239"))
				.andExpect(jsonPath("$.maxPartySize").value(6))
				.andExpect(jsonPath("$.tableSizes[0]").value(1))
				.andExpect(jsonPath("$.tableSizes[3]").value(6));
	}

	@Test
	void reserveAvailableTableThenItBecomesOccupied() throws Exception {
		MockHttpSession session = login();
		JsonNode availability = read(mvc.perform(get("/api/reservations/availability")
				.param("date", date).param("time", "20:00").param("partySize", "4")));
		JsonNode table = null;
		for (JsonNode t : availability.get("tables")) {
			if ("AVAILABLE".equals(t.get("state").asText())) {
				table = t;
				break;
			}
		}
		assertThat(table).as("an available table for 4").isNotNull();
		assertThat(table.get("seats").asInt()).isBetween(4, 8);

		String body = "{\"tableId\":" + table.get("id").asLong() + ",\"date\":\"" + date
				+ "\",\"time\":\"20:00\",\"partySize\":4}";
		JsonNode created = read(mvc.perform(post("/api/reservations").session(session)
				.contentType(MediaType.APPLICATION_JSON).content(body))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.status").value("CONFIRMED")));

		mvc.perform(post("/api/reservations").session(session).contentType(MediaType.APPLICATION_JSON).content(body))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.code").value("reservation.tableTaken"));

		mvc.perform(get("/api/reservations/mine").session(session))
				.andExpect(jsonPath("$[?(@.code == '" + created.get("code").asText() + "')]").exists());
		mvc.perform(delete("/api/reservations/" + created.get("code").asText()).session(session))
				.andExpect(jsonPath("$.status").value("CANCELLED"));
	}

	@Test
	void partiesLargerThanSixMustCallTheRestaurant() throws Exception {
		mvc.perform(get("/api/reservations/availability").header(HttpHeaders.ACCEPT_LANGUAGE, "en")
				.param("date", date).param("time", "20:00").param("partySize", "7"))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(jsonPath("$.code").value("reservation.partyTooLarge"))
				.andExpect(jsonPath("$.message").value(
						"For parties of more than 6 guests, please contact the restaurant at +55 11 94784-9239."));
	}

	@Test
	void reservingRequiresLogin() throws Exception {
		mvc.perform(post("/api/reservations").contentType(MediaType.APPLICATION_JSON)
				.content("{\"tableId\":1,\"date\":\"" + date + "\",\"time\":\"20:00\",\"partySize\":2}"))
				.andExpect(status().isUnauthorized());
	}

}
