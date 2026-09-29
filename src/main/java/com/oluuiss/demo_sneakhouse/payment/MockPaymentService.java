package com.oluuiss.demo_sneakhouse.payment;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.YearMonth;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.oluuiss.demo_sneakhouse.common.ApiException;

/**
 * Fictional payment gateway for the demo. No money moves and card data is never stored:
 * only the brand and last 4 digits are kept on the order.
 * <p>
 * Rules: the number must pass the Luhn check, the expiry must not be in the past and the CVV
 * must have 3–4 digits. Card 4000 0000 0000 0002 is always declined (to demo the error path).
 */
@Service
public class MockPaymentService {

	public static final String DECLINED_TEST_CARD = "4000000000000002";

	private static final Pattern EXPIRY = Pattern.compile("^(0[1-9]|1[0-2])\\s*/\\s*(\\d{2})$");

	private final Clock clock;

	public MockPaymentService(Clock clock) {
		this.clock = clock;
	}

	public record CardDetails(String holderName, String number, String expiry, String cvv) {
	}

	public record PaymentResult(String transactionId, String brand, String last4, BigDecimal amount) {
	}

	public PaymentResult charge(BigDecimal amount, CardDetails card) {
		String digits = card.number() == null ? "" : card.number().replaceAll("[\\s-]", "");
		if (!digits.matches("\\d{13,19}") || !passesLuhn(digits)) {
			throw ApiException.unprocessable("payment.invalidCard");
		}
		if (!isExpiryValid(card.expiry())) {
			throw ApiException.unprocessable("payment.expired");
		}
		if (card.cvv() == null || !card.cvv().matches("\\d{3,4}")) {
			throw ApiException.unprocessable("payment.invalidCvv");
		}
		if (DECLINED_TEST_CARD.equals(digits)) {
			throw new ApiException(org.springframework.http.HttpStatus.PAYMENT_REQUIRED, "payment.declined");
		}
		String transactionId = "MOCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
		return new PaymentResult(transactionId, brandOf(digits), digits.substring(digits.length() - 4), amount);
	}

	static boolean passesLuhn(String digits) {
		int sum = 0;
		boolean doubleIt = false;
		for (int i = digits.length() - 1; i >= 0; i--) {
			int d = digits.charAt(i) - '0';
			if (doubleIt) {
				d *= 2;
				if (d > 9) {
					d -= 9;
				}
			}
			sum += d;
			doubleIt = !doubleIt;
		}
		return sum % 10 == 0;
	}

	private boolean isExpiryValid(String expiry) {
		if (expiry == null) {
			return false;
		}
		Matcher m = EXPIRY.matcher(expiry.trim());
		if (!m.matches()) {
			return false;
		}
		YearMonth cardMonth = YearMonth.of(2000 + Integer.parseInt(m.group(2)), Integer.parseInt(m.group(1)));
		return !cardMonth.isBefore(YearMonth.now(clock));
	}

	static String brandOf(String digits) {
		if (digits.startsWith("4")) {
			return "VISA";
		}
		if (digits.matches("^(5[1-5]|2[2-7]).*")) {
			return "MASTERCARD";
		}
		if (digits.matches("^3[47].*")) {
			return "AMEX";
		}
		if (digits.matches("^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550).*")) {
			return "ELO";
		}
		return "CARD";
	}

}
