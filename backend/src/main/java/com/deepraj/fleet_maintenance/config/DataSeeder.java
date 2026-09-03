package com.deepraj.fleet_maintenance.config;

import com.deepraj.fleet_maintenance.entity.User;
import com.deepraj.fleet_maintenance.enums.Role;
import com.deepraj.fleet_maintenance.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    private static final String SYSTEM_USER_EMAIL = "system@fleet-maintenance.internal";

    public DataSeeder(UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepo.findByEmail(SYSTEM_USER_EMAIL).isEmpty()) {
            User systemUser = new User();
            systemUser.setEmail(SYSTEM_USER_EMAIL);
            systemUser.setFullName("System");
            systemUser.setRole(Role.FLEET_MANAGER);
            systemUser.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            userRepo.save(systemUser);
        }
    }
}
