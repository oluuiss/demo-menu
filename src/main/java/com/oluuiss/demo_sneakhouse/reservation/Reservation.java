package com.oluuiss.demo_sneakhouse.reservation;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "reservations")
public class Reservation {

	public enum Status {
		CONFIRMED, CANCELLED
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(unique = true, length = 20)
	private String code;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "table_id")
	private DiningTable table;

	@Column(name = "reservation_date", nullable = false)
	private LocalDate date;

	@Column(name = "reservation_time", nullable = false)
	private LocalTime time;

	@Column(name = "party_size", nullable = false)
	private int partySize;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 12)
	private Status status;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected Reservation() {
	}

	public Reservation(Long userId, DiningTable table, LocalDate date, LocalTime time, int partySize,
			Instant createdAt) {
		this.userId = userId;
		this.table = table;
		this.date = date;
		this.time = time;
		this.partySize = partySize;
		this.status = Status.CONFIRMED;
		this.createdAt = createdAt;
	}

	public void assignCode() {
		this.code = String.format("RS-%05d", 10000 + id);
	}

	public void cancel() {
		this.status = Status.CANCELLED;
	}

	public Long getId() {
		return id;
	}

	public String getCode() {
		return code;
	}

	public Long getUserId() {
		return userId;
	}

	public DiningTable getTable() {
		return table;
	}

	public LocalDate getDate() {
		return date;
	}

	public LocalTime getTime() {
		return time;
	}

	public int getPartySize() {
		return partySize;
	}

	public Status getStatus() {
		return status;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

}
