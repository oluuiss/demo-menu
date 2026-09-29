package com.oluuiss.demo_sneakhouse.order;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * How long an order stays in each status before moving on automatically.
 *
 * @param awaitingConfirmation time in "Aguardando confirmação da loja"
 * @param preparing            time in "Pedido sendo preparado"
 * @param outForDelivery       time in "Entregador em rota" (then "Pedido entregue")
 */
@ConfigurationProperties("app.orders")
public record OrderTimingProperties(Duration awaitingConfirmation, Duration preparing, Duration outForDelivery) {
}
