package com.oluuiss.demo_sneakhouse.reservation;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.oluuiss.demo_sneakhouse.common.AuthenticatedUser;
import com.oluuiss.demo_sneakhouse.reservation.ReservationDtos.AvailabilityResponse;
import com.oluuiss.demo_sneakhouse.reservation.ReservationDtos.CreateReservationRequest;
import com.oluuiss.demo_sneakhouse.reservation.ReservationDtos.OptionsResponse;
import com.oluuiss.demo_sneakhouse.reservation.ReservationDtos.ReservationResponse;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

	private final ReservationService reservationService;

	public ReservationController(ReservationService reservationService) {
		this.reservationService = reservationService;
	}

	/** Restaurant info, bookable dates/time slots and party-size limits. Public. */
	@GetMapping("/options")
	public OptionsResponse options() {
		return reservationService.options();
	}

	/** Floor plan with the state of every table for the given slot. Public. */
	@GetMapping("/availability")
	public AvailabilityResponse availability(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time,
			@RequestParam int partySize) {
		return reservationService.availability(date, time, partySize);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ReservationResponse create(AuthenticatedUser user, @Valid @RequestBody CreateReservationRequest body) {
		return reservationService.create(user.id(), body);
	}

	@GetMapping("/mine")
	public List<ReservationResponse> mine(AuthenticatedUser user) {
		return reservationService.upcoming(user.id());
	}

	@DeleteMapping("/{code}")
	public ReservationResponse cancel(AuthenticatedUser user, @PathVariable String code) {
		return reservationService.cancel(user.id(), code);
	}

}
