package com.oluuiss.demo_sneakhouse.user;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.oluuiss.demo_sneakhouse.common.ApiException;

@Service
public class UserService {

	private final UserRepository users;

	public UserService(UserRepository users) {
		this.users = users;
	}

	/** Loads the session user; a session pointing to a deleted user is treated as logged out. */
	public AppUser require(Long userId) {
		return users.findById(userId).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "auth.required"));
	}

}
