package com.eztask.identity.service;

import com.eztask.identity.dto.AuthDto.*;
import com.eztask.identity.model.Role;
import com.eztask.identity.model.User;
import com.eztask.identity.repository.RoleRepository;
import com.eztask.identity.repository.UserRepository;
import com.eztask.identity.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid credentials: user not found"));

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new RuntimeException("Invalid credentials: password does not match");
            }
        }

        List<String> authorities = user.getRoles().stream()
            .map(Role::getName)
            .collect(Collectors.toList());

        String token = jwtProvider.generateToken(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getRole(),
            authorities
        );

        UserResponse userResponse = new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getAvatar(),
            user.getRole()
        );

        return new AuthResponse(token, userResponse);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered in system");
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
            .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").build()));

        String rawPassword = request.getPassword() != null && !request.getPassword().isEmpty()
            ? request.getPassword() 
            : "password123";

        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(rawPassword))
            .role(request.getRole() != null ? request.getRole() : "Software Engineer")
            .avatar(request.getAvatar() != null ? request.getAvatar() : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80")
            .roles(Set.of(userRole))
            .build();

        User savedUser = userRepository.save(user);

        List<String> authorities = List.of("ROLE_USER");
        String token = jwtProvider.generateToken(
            savedUser.getId(),
            savedUser.getEmail(),
            savedUser.getName(),
            savedUser.getRole(),
            authorities
        );

        return new AuthResponse(token, new UserResponse(
            savedUser.getId(),
            savedUser.getName(),
            savedUser.getEmail(),
            savedUser.getAvatar(),
            savedUser.getRole()
        ));
    }

    @Transactional(readOnly = true)
    public UserResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getAvatar(), user.getRole());
    }
}
