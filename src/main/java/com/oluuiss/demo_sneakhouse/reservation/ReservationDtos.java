package com.oluuiss.demo_sneakhouse.reservation;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public final class ReservationDtos {

	private ReservationDtos() {
	}

	public record Restaurant(String name, String address, String city, String phone, double latitude,
			double longitude) {
	}

	public record OptionsResponse(Restaurant restaurant, List<LocalTime> timeSlots, LocalDate firstDate,
			LocalDate lastDate, int maxPartySize, List<Integer> tableSizes) {
	}

	/** state: AVAILABLE, OCCUPIED or UNSUITABLE (wrong size for the party). */
	public record TableAvailability(Long id, String code, int seats, DiningTable.Shape shape, DiningTable.Zone zone,
			int x, int y, int width, int height, String state) {
	}

	public record AvailabilityResponse(LocalDate date, LocalTime time, int partySize,
			List<TableAvailability> tables, int availableCount) {
	}

	public record CreateReservationRequest(
			@NotNull(message = "{validation.reservation.table}") Long tableId,
			@NotNull(message = "{validation.reservation.date}") LocalDate date,
			@NotNull(message = "{validation.reservation.time}") LocalTime time,
			@NotNull @Min(value = 1, message = "{validation.reservation.party}") Integer partySize) {
	}

	public record ReservationResponse(String code, LocalDate date, LocalTime time, int partySize, String tableCode,
			int tableSeats, DiningTable.Zone zone, String status, Restaurant restaurant) {
	}

}
