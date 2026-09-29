package com.oluuiss.demo_sneakhouse.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
		@NotBlank(message = "{validation.email.required}") String email,
		@NotBlank(message = "{validation.password.required}") String password) {
}
