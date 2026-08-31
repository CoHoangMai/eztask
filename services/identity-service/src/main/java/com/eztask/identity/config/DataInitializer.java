package com.eztask.identity.config;

import com.eztask.identity.model.Role;
import com.eztask.identity.model.User;
import com.eztask.identity.repository.RoleRepository;
import com.eztask.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> {
                    Role role = Role.builder().name("ROLE_USER").build();
                    return roleRepository.save(Objects.requireNonNull(role));
                });

        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> {
                    Role role = Role.builder().name("ROLE_ADMIN").build();
                    return roleRepository.save(Objects.requireNonNull(role));
                });

        // Ensure default seed users exist
        seedUserIfMissing("alex.morgan@eztask.dev", "Alex Morgan", "password123", "Lead Architect", "Engineering", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", Set.of(userRole, adminRole));
        seedUserIfMissing("sarah.chen@eztask.dev", "Sarah Chen", "password123", "Product Designer", "Design", "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150", Set.of(userRole));
        seedUserIfMissing("marcus.vance@eztask.dev", "Marcus Vance", "password123", "Senior Backend Dev", "Engineering", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", Set.of(userRole));
        seedUserIfMissing("elena.rostova@external-audit.com", "Elena Rostova", "password123", "External Auditor", "Audit & Security", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150", Set.of(userRole));
        seedUserIfMissing("david.kim@eztask.dev", "David Kim", "password123", "Head of Engineering", "Management", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", Set.of(userRole, adminRole));
        seedUserIfMissing("dev@eztask.dev", "Developer", "password123", "Senior Developer", "Engineering", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", Set.of(userRole));
    }

    private void seedUserIfMissing(String email, String name, String password, String roleTitle, String department, String avatar, Set<Role> roles) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .email(email)
                    .name(name)
                    .password(passwordEncoder.encode(password))
                    .role(roleTitle)
                    .department(department)
                    .avatar(avatar)
                    .roles(roles)
                    .build();
            userRepository.save(Objects.requireNonNull(user));
            log.info("Initialized default user: {}", email);
        }
    }
}
