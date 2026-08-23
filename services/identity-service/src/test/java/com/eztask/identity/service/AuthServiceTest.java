package com.eztask.identity.service;

import com.eztask.identity.dto.AuthDto.*;
import com.eztask.identity.model.Role;
import com.eztask.identity.model.User;
import com.eztask.identity.repository.RoleRepository;
import com.eztask.identity.repository.UserRepository;
import com.eztask.identity.security.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtProvider jwtProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private Role sampleRole;

    @BeforeEach
    void setUp() {
        sampleRole = Role.builder().id(1).name("ROLE_USER").build();
        sampleUser = User.builder()
            .id(1L)
            .name("Alex Morgan")
            .email("alex.morgan@eztask.dev")
            .password("$2a$12$hashedPassword")
            .role("Lead Architect")
            .roles(Set.of(sampleRole))
            .build();
    }

    @Test
    @DisplayName("Login Success: Valid email & password returns valid JWT Token")
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest();
        request.setEmail("alex.morgan@eztask.dev");
        request.setPassword("password123");

        when(userRepository.findByEmail("alex.morgan@eztask.dev")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("password123", sampleUser.getPassword())).thenReturn(true);
        when(jwtProvider.generateToken(any(), any(), any(), any(), any())).thenReturn("mocked.jwt.token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals("Alex Morgan", response.getUser().getName());
        assertEquals("alex.morgan@eztask.dev", response.getUser().getEmail());
    }

    @Test
    @DisplayName("Login Fail: Wrong password throws RuntimeException")
    void testLoginWrongPassword() {
        LoginRequest request = new LoginRequest();
        request.setEmail("alex.morgan@eztask.dev");
        request.setPassword("wrongpass");

        when(userRepository.findByEmail("alex.morgan@eztask.dev")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongpass", sampleUser.getPassword())).thenReturn(false);

        assertThrows(RuntimeException.class, () -> authService.login(request));
    }
}
