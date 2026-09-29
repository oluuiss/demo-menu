package com.oluuiss.demo_sneakhouse.profile;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.oluuiss.demo_sneakhouse.common.AppLanguage;
import com.oluuiss.demo_sneakhouse.common.AuthenticatedUser;
import com.oluuiss.demo_sneakhouse.user.AppUser;
import com.oluuiss.demo_sneakhouse.user.IdentityDocument;
import com.oluuiss.demo_sneakhouse.user.UserService;

/**
 * Read-only profile. This is a public demo, so there are intentionally no update endpoints.
 */
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

	private final UserService userService;

	public ProfileController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	public ProfileResponse profile(AuthenticatedUser current) {
		AppUser user = userService.require(current.id());
		String country = AppLanguage.current().country();
		IdentityDocument doc = user.getDocuments().get(country);
		ProfileResponse.Document document = doc == null ? null
				: new ProfileResponse.Document(country, doc.getType(), doc.maskedNumber());
		return new ProfileResponse(user.getName(), user.getEmail(), user.getPhone(), user.getBirthDate(),
				user.getAvatarUrl(), document, false);
	}

}
