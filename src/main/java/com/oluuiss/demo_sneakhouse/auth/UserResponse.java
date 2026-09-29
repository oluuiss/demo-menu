package com.oluuiss.demo_sneakhouse.auth;

import com.oluuiss.demo_sneakhouse.user.AppUser;

public record UserResponse(Long id, String email, String name, String avatarUrl) {

	public static UserResponse from(AppUser user) {
		return new UserResponse(user.getId(), user.getEmail(), user.getName(), user.getAvatarUrl());
	}

}
