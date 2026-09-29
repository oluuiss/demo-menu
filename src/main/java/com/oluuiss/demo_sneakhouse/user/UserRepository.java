package com.oluuiss.demo_sneakhouse.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<AppUser, Long> {

	Optional<AppUser> findByEmailIgnoreCase(String email);

}
