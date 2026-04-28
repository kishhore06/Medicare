package com.medicare.demo.security;

<<<<<<< HEAD
import com.medicare.demo.entity.User;
import com.medicare.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
=======
import java.util.Collections;

>>>>>>> 7c0bd9592874ae36c59cd7708ea5990c74fd6e2f
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

<<<<<<< HEAD
import java.util.Collections;
=======
import com.medicare.demo.entity.User;
import com.medicare.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;
>>>>>>> 7c0bd9592874ae36c59cd7708ea5990c74fd6e2f

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
