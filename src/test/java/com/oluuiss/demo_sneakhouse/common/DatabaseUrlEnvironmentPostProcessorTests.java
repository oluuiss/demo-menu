package com.oluuiss.demo_sneakhouse.common;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;

import org.junit.jupiter.api.Test;

class DatabaseUrlEnvironmentPostProcessorTests {

	@Test
	void convertsNeonUrlToJdbcProperties() {
		Map<String, Object> props = DatabaseUrlEnvironmentPostProcessor.toSpringProperties(
				"postgresql://brasa:s3cr%40t@ep-x.sa-east-1.aws.neon.tech/brasa?sslmode=require&channel_binding=require");
		assertThat(props).containsEntry("spring.datasource.url",
				"jdbc:postgresql://ep-x.sa-east-1.aws.neon.tech/brasa?sslmode=require");
		assertThat(props).containsEntry("spring.datasource.username", "brasa");
		assertThat(props).containsEntry("spring.datasource.password", "s3cr@t");
	}

	@Test
	void keepsPortAndAcceptsPostgresScheme() {
		Map<String, Object> props = DatabaseUrlEnvironmentPostProcessor
				.toSpringProperties("postgres://user:pw@localhost:5433/app");
		assertThat(props).containsEntry("spring.datasource.url", "jdbc:postgresql://localhost:5433/app");
	}

	@Test
	void rejectsOtherSchemes() {
		assertThatThrownBy(() -> DatabaseUrlEnvironmentPostProcessor.toSpringProperties("mysql://u:p@h/db"))
				.isInstanceOf(IllegalArgumentException.class);
	}

}
