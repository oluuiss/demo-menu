package com.oluuiss.demo_sneakhouse.common;

/**
 * The logged-in user, injected into controller methods by {@link AuthenticatedUserArgumentResolver}.
 * Declaring a parameter of this type makes the endpoint require a session (401 otherwise).
 */
public record AuthenticatedUser(Long id) {

	public static final String SESSION_ATTRIBUTE = "userId";

}
