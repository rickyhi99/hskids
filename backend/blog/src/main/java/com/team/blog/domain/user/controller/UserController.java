package com.team.blog.domain.user.controller;

import com.team.blog.domain.user.dto.UserJoinRequestDto;
import com.team.blog.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/join")
    public ResponseEntity<Void> join(@RequestBody UserJoinRequestDto dto) {
        userService.join(dto);
        return ResponseEntity.ok().build();
    }

    // ?id=xxx 로 들어올 때
    @GetMapping(value = "/check", params = "id")
    public ResponseEntity<Boolean> checkId(@RequestParam String id) {
        return ResponseEntity.ok(userService.existsById(id));
    }

    // ?email=xxx 로 들어올 때
    @GetMapping(value = "/check", params = "email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(userService.existsByEmail(email));
    }
}
