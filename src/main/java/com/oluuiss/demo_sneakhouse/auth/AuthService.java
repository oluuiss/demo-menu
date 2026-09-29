package com.oluuiss.demo_sneakhouse.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.oluuiss.demo_sneakhouse.common.ApiException;
import com.oluuiss.demo_sneakhouse.user.AppUser;
import com.oluuiss.demo_sneakhouse.user.UserRepository;

@Service
public class AuthService {

	private final UserRepository users;
	private final PasswordEncoder passwordEncoder;

	public AuthService(UserRepository users, PasswordEncoder passwordEncoder) {
		this.users = users;
		this.passwordEncoder = passwordEncoder;
	}

	public AppUser authenticate(String email, String password) {
		AppUser user = users.findByEmailIgnoreCase(email.trim()).orElse(null);
		if (user == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
			throw new ApiException(HttpStatus.UNAUTHORIZED, "auth.invalidCredentials");
		}
		return user;
	}

}
