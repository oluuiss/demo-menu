package com.oluuiss.demo_sneakhouse.reservation;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.oluuiss.demo_sneakhouse.common.ApiException;
import com.oluuiss.demo_sneakhouse.reservation.ReservationDtos.AvailabilityResponse;
import com.oluuiss.demo_sneakhouse.reservation.ReservationDtos.CreateReservationRequest;
import com.oluuiss.demo_sneakhouse.reservation.ReservationDtos.OptionsResponse;
import com.oluuiss.demo_sneakhouse.reservation.ReservationDtos.ReservationResponse;
import com.oluuiss.demo_sneakhouse.reservation.ReservationDtos.Restaurant;
import com.oluuiss.demo_sneakhouse.reservation.ReservationDtos.TableAvailability;

@Service
@Transactional
public class ReservationService {

	static final String AVAILABLE = "AVAILABLE";
	static final String OCCUPIED = "OCCUPIED";
	static final String UNSUITABLE = "UNSUITABLE";

	private final DiningTableRepository tables;
	private final ReservationRepository reservations;
	private final RestaurantProperties restaurant;
	private final Clock clock;

	public ReservationService(DiningTableRepository tables, ReservationRepository reservations,
			RestaurantProperties restaurant, Clock clock) {
		this.tables = tables;
		this.reservations = reservations;
		this.restaurant = restaurant;
		this.clock = clock;
	}

	@Transactional(readOnly = true)
	public OptionsResponse options() {
		LocalDate today = LocalDate.now(clock);
		List<Integer> sizes = tables.findAll().stream().map(DiningTable::getSeats).distinct().sorted().toList();
		return new OptionsResponse(restaurantInfo(), timeSlots(), today, today.plusDays(restaurant.bookingWindowDays()),
				restaurant.maxPartySize(), sizes);
	}

	@Transactional(readOnly = true)
	public AvailabilityResponse availability(LocalDate date, LocalTime time, int partySize) {
		validateRequest(date, time, partySize);
		List<Reservation> booked = reservations.findByDateAndStatus(date, Reservation.Status.CONFIRMED);
		List<TableAvailability> result = new ArrayList<>();
		int available = 0;
		for (DiningTable table : tables.findAllByOrderByCodeAsc()) {
			String state = !table.fits(partySize) ? UNSUITABLE
					: isOccupied(table, date, time, booked) ? OCCUPIED : AVAILABLE;
			if (AVAILABLE.equals(state)) {
				available++;
			}
			result.add(new TableAvailability(table.getId(), table.getCode(), table.getSeats(), table.getShape(),
					table.getZone(), table.getX(), table.getY(), table.getWidth(), table.getHeight(), state));
		}
		return new AvailabilityResponse(date, time, partySize, result, available);
	}

	public ReservationResponse create(Long userId, CreateReservationRequest request) {
		validateRequest(request.date(), request.time(), request.partySize());
		DiningTable table = tables.findById(request.tableId())
				.orElseThrow(() -> ApiException.notFound("reservation.tableNotFound"));
		if (!table.fits(request.partySize())) {
			throw ApiException.unprocessable("reservation.tableSize", table.getSeats(), request.partySize());
		}
		List<Reservation> booked = reservations.findByDateAndStatus(request.date(), Reservation.Status.CONFIRMED);
		if (isOccupied(table, request.date(), request.time(), booked)) {
			throw ApiException.conflict("reservation.tableTaken");
		}
		Reservation reservation = reservations.save(new Reservation(userId, table, request.date(), request.time(),
				request.partySize(), clock.instant()));
		reservation.assignCode();
		return toResponse(reservation);
	}

	@Transactional(readOnly = true)
	public List<ReservationResponse> upcoming(Long userId) {
		return reservations
				.findByUserIdAndStatusAndDateGreaterThanEqualOrderByDateAscTimeAsc(userId, Reservation.Status.CONFIRMED,
						LocalDate.now(clock))
				.stream().map(this::toResponse).toList();
	}

	public ReservationResponse cancel(Long userId, String code) {
		Reservation reservation = reservations.findByCodeAndUserId(code, userId)
				.orElseThrow(() -> ApiException.notFound("reservation.notFound"));
		reservation.cancel();
		return toResponse(reservation);
	}

	/** Bookable slots from opening to last seating, every slotInterval. */
	List<LocalTime> timeSlots() {
		List<LocalTime> slots = new ArrayList<>();
		for (LocalTime t = restaurant.opening(); !t.isAfter(restaurant.lastSeating()); t = t
				.plus(restaurant.slotInterval())) {
			slots.add(t);
		}
		return slots;
	}

	private void validateRequest(LocalDate date, LocalTime time, int partySize) {
		if (partySize < 1) {
			throw ApiException.badRequest("validation.reservation.party");
		}
		if (partySize > restaurant.maxPartySize()) {
			throw ApiException.unprocessable("reservation.partyTooLarge", restaurant.maxPartySize(),
					restaurant.phone());
		}
		LocalDate today = LocalDate.now(clock);
		if (date.isBefore(today) || date.isAfter(today.plusDays(restaurant.bookingWindowDays()))) {
			throw ApiException.unprocessable("reservation.invalidDate", restaurant.bookingWindowDays());
		}
		if (!timeSlots().contains(time)) {
			throw ApiException.unprocessable("reservation.invalidTime");
		}
		if (!LocalDateTime.of(date, time).isAfter(LocalDateTime.now(clock))) {
			throw ApiException.unprocessable("reservation.slotPassed");
		}
	}

	private boolean isOccupied(DiningTable table, LocalDate date, LocalTime time, List<Reservation> booked) {
		for (Reservation r : booked) {
			if (r.getTable().getId().equals(table.getId())
					&& Duration.between(r.getTime(), time).abs().compareTo(restaurant.tableTurnover()) < 0) {
				return true;
			}
		}
		return isSimulatedBooking(table.getCode(), date, time);
	}

	/**
	 * Deterministic "other guests": the same table/date/time is always busy or always free, so the
	 * floor plan looks lived-in without storing fake reservations.
	 */
	boolean isSimulatedBooking(String tableCode, LocalDate date, LocalTime time) {
		int bucket = Math.floorMod(Objects.hash(tableCode, date.toString(), time.toString()) * 31 + 17, 100);
		return bucket < restaurant.simulatedOccupancyPercent();
	}

	private Restaurant restaurantInfo() {
		return new Restaurant(restaurant.name(), restaurant.address(), restaurant.city(), restaurant.phone(),
				restaurant.latitude(), restaurant.longitude());
	}

	private ReservationResponse toResponse(Reservation r) {
		return new ReservationResponse(r.getCode(), r.getDate(), r.getTime(), r.getPartySize(),
				r.getTable().getCode(), r.getTable().getSeats(), r.getTable().getZone(), r.getStatus().name(),
				restaurantInfo());
	}

}
