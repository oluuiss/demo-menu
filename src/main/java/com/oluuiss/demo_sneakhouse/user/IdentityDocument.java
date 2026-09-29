package com.oluuiss.demo_sneakhouse.user;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class IdentityDocument {

	/** CPF (Brazil), SSN (United States) or PERSONALAUSWEIS (Germany). */
	@Column(name = "document_type", nullable = false)
	private String type;

	@Column(name = "document_number", nullable = false)
	private String number;

	protected IdentityDocument() {
	}

	public IdentityDocument(String type, String number) {
		this.type = type;
		this.number = number;
	}

	public String getType() {
		return type;
	}

	public String getNumber() {
		return number;
	}

	/** Keeps only the last 4 alphanumeric characters visible, preserving separators. */
	public String maskedNumber() {
		int visible = 4;
		int alnumSeen = 0;
		StringBuilder out = new StringBuilder(number);
		for (int i = number.length() - 1; i >= 0; i--) {
			if (Character.isLetterOrDigit(number.charAt(i))) {
				alnumSeen++;
				if (alnumSeen > visible) {
					out.setCharAt(i, '•');
				}
			}
		}
		return out.toString();
	}

}
