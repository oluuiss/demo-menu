package com.oluuiss.demo_sneakhouse.reservation;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

	List<Reservation> findByDateAndStatus(LocalDate date, Reservation.Status status);

	List<Reservation> findByUserIdAndStatusAndDateGreaterThanEqualOrderByDateAscTimeAsc(Long userId,
			Reservation.Status status, LocalDate from);

	Optional<Reservation> findByCodeAndUserId(String code, Long userId);

}
