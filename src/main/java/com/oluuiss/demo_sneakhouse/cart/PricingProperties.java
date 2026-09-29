package com.oluuiss.demo_sneakhouse.cart;

import java.math.BigDecimal;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @param deliveryFee           flat delivery fee
 * @param freeDeliveryThreshold subtotal from which delivery is free
 * @param maxQuantityPerItem    maximum quantity of a single item in the cart
 */
@ConfigurationProperties("app.pricing")
public record PricingProperties(BigDecimal deliveryFee, BigDecimal freeDeliveryThreshold, int maxQuantityPerItem) {
}
