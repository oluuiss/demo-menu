package com.oluuiss.demo_sneakhouse.common;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** @param address fictional delivery address used for every order (no real delivery integration) */
@ConfigurationProperties("app.delivery")
public record DeliveryProperties(String address) {
}
