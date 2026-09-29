package com.oluuiss.demo_sneakhouse.common;

import java.util.Locale;

import org.springframework.context.i18n.LocaleContextHolder;

/** Languages supported by the site, with the country used for country-specific data (e.g. ID documents). */
public enum AppLanguage {

	PT("pt", "BR"), EN("en", "US"), DE("de", "DE");

	private final String code;
	private final String country;

	AppLanguage(String code, String country) {
		this.code = code;
		this.country = country;
	}

	public String code() {
		return code;
	}

	public String country() {
		return country;
	}

	public static AppLanguage from(Locale locale) {
		String language = locale == null ? "" : locale.getLanguage();
		for (AppLanguage lang : values()) {
			if (lang.code.equals(language)) {
				return lang;
			}
		}
		return PT;
	}

	/** Language of the current request (from the Accept-Language header). */
	public static AppLanguage current() {
		return from(LocaleContextHolder.getLocale());
	}

}
