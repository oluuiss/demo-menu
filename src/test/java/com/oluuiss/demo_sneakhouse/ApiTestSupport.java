package com.oluuiss.demo_sneakhouse;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/** Base class for API integration tests: in-memory DB, MockMvc and a logged-in demo session. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class ApiTestSupport {

	@Autowired
	protected MockMvc mvc;

	@Autowired
	protected ObjectMapper json;

	protected MockHttpSession login() throws Exception {
		MockHttpSession session = new MockHttpSession();
		mvc.perform(post("/api/auth/login").session(session).contentType(MediaType.APPLICATION_JSON)
				.content("{\"email\":\"usuario@demo\",\"password\":\"usuario\"}"))
				.andExpect(status().isOk());
		return session;
	}

	protected JsonNode read(org.springframework.test.web.servlet.ResultActions result) throws Exception {
		return json.readTree(result.andReturn().getResponse().getContentAsString());
	}

}
