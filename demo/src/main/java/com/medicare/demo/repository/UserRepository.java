package com.medicare.demo.repository;

<<<<<<< HEAD
import com.medicare.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

=======
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medicare.demo.entity.User;

>>>>>>> 7c0bd9592874ae36c59cd7708ea5990c74fd6e2f
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
