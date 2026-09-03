package com.deepraj.fleet_maintenance.controller;

import com.deepraj.fleet_maintenance.dto.UserDtos.UserSummary;
import com.deepraj.fleet_maintenance.enums.Role;
import com.deepraj.fleet_maintenance.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepo;

    public UserController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<UserSummary>> listTechnicians() {
        List<UserSummary> technicians = userRepo.findByRole(Role.TECHNICIAN).stream()
                .map(u -> new UserSummary(u.getId(), u.getFullName(), u.getEmail()))
                .toList();
        return ResponseEntity.ok(technicians);
    }
}
