package com.oluuiss.demo_sneakhouse.common;

import java.time.Clock;
import java.util.List;
import java.util.Locale;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	/** The React app sends the selected language as Accept-Language (pt-BR, en or de). */
	@Bean
	public LocaleResolver localeResolver() {
		AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
		resolver.setSupportedLocales(List.of(Locale.forLanguageTag("pt-BR"), Locale.ENGLISH, Locale.GERMAN));
		resolver.setDefaultLocale(Locale.forLanguageTag("pt-BR"));
		return resolver;
	}

	/** Injectable clock so time-based logic (order status, reservation dates) is testable. */
	@Bean
	public Clock clock() {
		return Clock.systemDefaultZone();
	}

	@Override
	public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
		resolvers.add(new AuthenticatedUserArgumentResolver());
	}

}
