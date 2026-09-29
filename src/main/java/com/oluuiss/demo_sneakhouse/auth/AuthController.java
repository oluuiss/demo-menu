package com.oluuiss.demo_sneakhouse.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.oluuiss.demo_sneakhouse.common.AuthenticatedUser;
import com.oluuiss.demo_sneakhouse.user.AppUser;
import com.oluuiss.demo_sneakhouse.user.UserService;

/**
 * Session based authentication. On success the user id is stored in the HTTP session
 * (HttpOnly JSESSIONID cookie), which the React app sends back on every request.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;
	private final UserService userService;

	public AuthController(AuthService authService, UserService userService) {
		this.authService = authService;
		this.userService = userService;
	}

	@PostMapping("/login")
	public UserResponse login(@Valid @RequestBody LoginRequest body, HttpServletRequest request) {
		AppUser user = authService.authenticate(body.email(), body.password());
		HttpSession session = request.getSession(true);
		request.changeSessionId(); // prevent session fixation
		session.setAttribute(AuthenticatedUser.SESSION_ATTRIBUTE, user.getId());
		return UserResponse.from(user);
	}

	@GetMapping("/me")
	public UserResponse me(AuthenticatedUser current) {
		return UserResponse.from(userService.require(current.id()));
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session != null) {
			session.invalidate();
		}
		return ResponseEntity.noContent().build();
	}

}
