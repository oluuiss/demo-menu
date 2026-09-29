package com.oluuiss.demo_sneakhouse.common;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class Money {

	private Money() {
	}

	public static BigDecimal of(BigDecimal value) {
		return value.setScale(2, RoundingMode.HALF_UP);
	}

	public static BigDecimal zero() {
		return of(BigDecimal.ZERO);
	}

}
