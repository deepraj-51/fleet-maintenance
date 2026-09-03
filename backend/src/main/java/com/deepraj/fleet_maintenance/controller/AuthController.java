package com.deepraj.fleet_maintenance.controller;

import com.deepraj.fleet_maintenance.dto.AuthDtos.*;
import com.deepraj.fleet_maintenance.entity.User;
import com.deepraj.fleet_maintenance.repository.UserRepository;
import com.deepraj.fleet_maintenance.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    public AuthController(UserRepository userRepo, PasswordEncoder passwordEncoder,
                          JwtService jwtService, AuthenticationManager authManager) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authManager = authManager;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        if (userRepo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = new User();
        user.setEmail(req.email());
        user.setFullName(req.fullName());
        user.setRole(req.role());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        userRepo.save(user);

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));

        User user = userRepo.findByEmail(req.email())
                .orElseThrow(() -> new IllegalStateException("User not found after authentication"));

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole()));
    }
}
