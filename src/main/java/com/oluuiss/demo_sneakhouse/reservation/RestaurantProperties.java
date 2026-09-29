package com.oluuiss.demo_sneakhouse.reservation;

import java.time.Duration;
import java.time.LocalTime;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * The (fictional) restaurant that takes reservations.
 *
 * @param lastSeating              last bookable time slot
 * @param tableTurnover            how long a reservation blocks its table
 * @param simulatedOccupancyPercent share of slots pre-booked by fictional guests, so the floor plan looks realistic
 */
@ConfigurationProperties("app.restaurant")
public record RestaurantProperties(
		String name,
		String address,
		String city,
		String phone,
		double latitude,
		double longitude,
		LocalTime opening,
		LocalTime lastSeating,
		Duration slotInterval,
		Duration tableTurnover,
		int maxPartySize,
		int bookingWindowDays,
		int simulatedOccupancyPercent) {
}
