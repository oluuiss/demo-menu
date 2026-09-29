package com.oluuiss.demo_sneakhouse.reservation;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * A table on the floor plan. Coordinates are the table centre in a 600 x 420 plan (landscape).
 */
@Entity
@Table(name = "dining_tables")
public class DiningTable {

	public enum Shape {
		ROUND, RECT
	}

	public enum Zone {
		BAR, WINDOW, MAIN, LOUNGE
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 10)
	private String code;

	@Column(nullable = false)
	private int seats;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 10)
	private Shape shape;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 10)
	private Zone zone;

	@Column(name = "pos_x", nullable = false)
	private int x;

	@Column(name = "pos_y", nullable = false)
	private int y;

	@Column(nullable = false)
	private int width;

	@Column(nullable = false)
	private int height;

	protected DiningTable() {
	}

	public DiningTable(String code, int seats, Shape shape, Zone zone, int x, int y, int width, int height) {
		this.code = code;
		this.seats = seats;
		this.shape = shape;
		this.zone = zone;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	/** A party fits if the table is big enough without wasting more than half of it. */
	public boolean fits(int partySize) {
		return seats >= partySize && seats <= partySize * 2;
	}

	public Long getId() {
		return id;
	}

	public String getCode() {
		return code;
	}

	public int getSeats() {
		return seats;
	}

	public Shape getShape() {
		return shape;
	}

	public Zone getZone() {
		return zone;
	}

	public int getX() {
		return x;
	}

	public int getY() {
		return y;
	}

	public int getWidth() {
		return width;
	}

	public int getHeight() {
		return height;
	}

}
