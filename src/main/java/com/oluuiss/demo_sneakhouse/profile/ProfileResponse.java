package com.oluuiss.demo_sneakhouse.profile;

import java.time.LocalDate;

public record ProfileResponse(
		String name,
		String email,
		String phone,
		LocalDate birthDate,
		String avatarUrl,
		Document document,
		boolean editable) {

	/** ID document for the country of the selected language; the number is masked. */
	public record Document(String country, String type, String number) {
	}

}
