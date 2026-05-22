package com.team.blog.domain.user.controller;

import com.team.blog.domain.user.dto.UserInfoUpdateDto;
import com.team.blog.domain.user.dto.UserJoinRequestDto;
import com.team.blog.domain.user.dto.UserMeResponse;
import com.team.blog.domain.user.dto.UserPwdUpdateDto;
import com.team.blog.domain.user.service.UserService;
import com.team.blog.global.api.ApiResponse;
import com.team.blog.global.api.SuccessCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/join")
    // 공통 ApiResponse 형식 반환
    public ResponseEntity<ApiResponse<Void>> join(@RequestBody UserJoinRequestDto dto) {
        userService.join(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(SuccessCode.SUCCESS_CREATED));
    }

    // ?id=xxx 로 들어올 때
    @GetMapping(value = "/check", params = "id")
    public ResponseEntity<ApiResponse<Boolean>> checkId(@RequestParam String id) {
        return ResponseEntity.ok(ApiResponse.success(userService.existsById(id)));
    }

    // ?email=xxx 로 들어올 때
    @GetMapping(value = "/check", params = "email")
    public ResponseEntity<ApiResponse<Boolean>> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(ApiResponse.success(userService.existsByEmail(email)));
    }

    // ?nickname=xxx 로 들어올 때
    @GetMapping(value = "/check", params = "nickname")
    public ResponseEntity<ApiResponse<Boolean>> checkNickname(@RequestParam String nickname) {
        return ResponseEntity.ok(ApiResponse.success(userService.existsByNickname(nickname)));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> updatePassword(@RequestBody UserPwdUpdateDto dto) {
        userService.updatePassword(dto);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.SUCCESS_OK));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<Void>> updateInfo(Authentication auth,
                                                        @RequestBody UserInfoUpdateDto dto) {
        userService.updateInfo(auth.getName(), dto);
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.SUCCESS_OK));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> withdraw(Authentication auth) {
        userService.withdraw(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(SuccessCode.SUCCESS_OK));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserMeResponse>> getMe(Authentication authentication) {
        String loginId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(new UserMeResponse(userService.findByLoginId(loginId))));
    }
}
