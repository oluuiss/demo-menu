package com.oluuiss.demo_sneakhouse.common;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.StringJoiner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.util.StringUtils;

/**
 * Lets the app be configured with a single {@code DATABASE_URL} in the usual Postgres URI form
 * (as shown by Neon, Render, Heroku...): {@code postgresql://user:password@host[:port]/database?sslmode=require}.
 * It is translated into the {@code spring.datasource.*} properties Spring expects.
 * Explicit {@code SPRING_DATASOURCE_URL} settings always win.
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

	private static final String SOURCE_NAME = "databaseUrl";

	@Override
	public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
		String databaseUrl = environment.getProperty("DATABASE_URL");
		if (!StringUtils.hasText(databaseUrl) || environment.containsProperty("SPRING_DATASOURCE_URL")) {
			return;
		}
		environment.getPropertySources().addFirst(new MapPropertySource(SOURCE_NAME, toSpringProperties(databaseUrl)));
	}

	static Map<String, Object> toSpringProperties(String databaseUrl) {
		URI uri = URI.create(databaseUrl.trim());
		String scheme = uri.getScheme();
		if (!"postgres".equals(scheme) && !"postgresql".equals(scheme)) {
			throw new IllegalArgumentException("DATABASE_URL must start with postgresql:// or postgres://");
		}

		StringBuilder jdbc = new StringBuilder("jdbc:postgresql://").append(uri.getHost());
		if (uri.getPort() > 0) {
			jdbc.append(':').append(uri.getPort());
		}
		jdbc.append(uri.getRawPath());

		// Keep the JDBC-compatible options (sslmode, ...); drop libpq-only ones the JDBC driver does not know.
		if (uri.getRawQuery() != null) {
			StringJoiner query = new StringJoiner("&");
			for (String param : uri.getRawQuery().split("&")) {
				if (!param.isBlank() && !param.startsWith("channel_binding=")) {
					query.add(param);
				}
			}
			if (query.length() > 0) {
				jdbc.append('?').append(query);
			}
		}

		Map<String, Object> props = new HashMap<>();
		props.put("spring.datasource.url", jdbc.toString());
		String userInfo = uri.getRawUserInfo();
		if (userInfo != null) {
			int colon = userInfo.indexOf(':');
			props.put("spring.datasource.username", decode(colon < 0 ? userInfo : userInfo.substring(0, colon)));
			if (colon >= 0) {
				props.put("spring.datasource.password", decode(userInfo.substring(colon + 1)));
			}
		}
		return props;
	}

	private static String decode(String value) {
		return URLDecoder.decode(value, StandardCharsets.UTF_8);
	}

}
