package com.oluuiss.demo_sneakhouse.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;

import com.oluuiss.demo_sneakhouse.ApiTestSupport;
import com.oluuiss.demo_sneakhouse.user.UserRepository;

class AuthControllerTests extends ApiTestSupport {

	@Autowired
	private UserRepository users;

	@Test
	void demoUserIsSeededWithHashedPassword() {
		var user = users.findByEmailIgnoreCase("usuario@demo").orElseThrow();
		assertThat(user.getPasswordHash()).startsWith("$2").isNotEqualTo("usuario");
		assertThat(users.count()).isEqualTo(1);
	}

	@Test
	void loginWithDemoCredentialsCreatesSession() throws Exception {
		MockHttpSession session = login();
		mvc.perform(get("/api/auth/me").session(session))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value("usuario@demo"))
				.andExpect(jsonPath("$.avatarUrl").value("/images/gatinho.jpeg"));
	}

	@Test
	void wrongPasswordIsRejectedWithLocalizedMessage() throws Exception {
		mvc.perform(post("/api/auth/login").header(HttpHeaders.ACCEPT_LANGUAGE, "de")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"email\":\"usuario@demo\",\"password\":\"errada\"}"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.code").value("auth.invalidCredentials"))
				.andExpect(jsonPath("$.message").value("E-Mail oder Passwort ist falsch."));
	}

	@Test
	void blankFieldsReturnFieldErrors() throws Exception {
		mvc.perform(post("/api/auth/login").header(HttpHeaders.ACCEPT_LANGUAGE, "en")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"email\":\"\",\"password\":\"\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fields.email").value("Enter your email or username."))
				.andExpect(jsonPath("$.fields.password").exists());
	}

	@Test
	void meWithoutSessionIsUnauthorized() throws Exception {
		mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
	}

	@Test
	void profileIsReadOnlyAndDocumentFollowsLanguage() throws Exception {
		MockHttpSession session = login();
		mvc.perform(get("/api/profile").session(session).header(HttpHeaders.ACCEPT_LANGUAGE, "pt-BR"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.editable").value(false))
				.andExpect(jsonPath("$.name").value("Luis Porto"))
				.andExpect(jsonPath("$.birthDate").value("2005-11-25"))
				.andExpect(jsonPath("$.document.type").value("CPF"))
				.andExpect(jsonPath("$.document.number").value("•••.•••.•89-09"));
		mvc.perform(get("/api/profile").session(session).header(HttpHeaders.ACCEPT_LANGUAGE, "en"))
				.andExpect(jsonPath("$.document.type").value("SSN"));
		mvc.perform(get("/api/profile").session(session).header(HttpHeaders.ACCEPT_LANGUAGE, "de"))
				.andExpect(jsonPath("$.document.type").value("PERSONALAUSWEIS"));
	}

}
