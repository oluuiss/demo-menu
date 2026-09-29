package com.oluuiss.demo_sneakhouse.user;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_users")
public class AppUser {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(nullable = false)
	private String name;

	/** BCrypt hash, never the raw password. */
	@Column(name = "password_hash", nullable = false)
	private String passwordHash;

	private String phone;

	@Column(name = "birth_date")
	private LocalDate birthDate;

	@Column(name = "avatar_url")
	private String avatarUrl;

	/** Identity documents keyed by ISO country code (BR, US, DE). */
	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "user_documents", joinColumns = @JoinColumn(name = "user_id"))
	@MapKeyColumn(name = "country", length = 2)
	private Map<String, IdentityDocument> documents = new HashMap<>();

	protected AppUser() {
	}

	public AppUser(String email, String name, String passwordHash) {
		this.email = email;
		this.name = name;
		this.passwordHash = passwordHash;
	}

	/** Demo profile data (read-only for the user; set by the seeder). */
	public void updateProfile(String name, String phone, LocalDate birthDate, String avatarUrl,
			Map<String, IdentityDocument> documents) {
		this.name = name;
		this.phone = phone;
		this.birthDate = birthDate;
		this.avatarUrl = avatarUrl;
		this.documents.clear();
		this.documents.putAll(documents);
	}

	public Long getId() {
		return id;
	}

	public String getEmail() {
		return email;
	}

	public String getName() {
		return name;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public String getPhone() {
		return phone;
	}

	public LocalDate getBirthDate() {
		return birthDate;
	}

	public String getAvatarUrl() {
		return avatarUrl;
	}

	public Map<String, IdentityDocument> getDocuments() {
		return documents;
	}

}
