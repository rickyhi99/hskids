package com.team.blog.domain.neighbor.controller;

import com.team.blog.domain.neighbor.dto.request.NeighborRequest;
import com.team.blog.domain.neighbor.dto.request.NeighborUpdateRequest;
import com.team.blog.domain.neighbor.dto.response.NeighborDetailResponse;
import com.team.blog.domain.neighbor.dto.response.NeighborRequestResponse;
import com.team.blog.domain.neighbor.dto.response.NeighborUserResponse;
import com.team.blog.domain.neighbor.service.NeighborService;
import com.team.blog.global.api.ApiResponse;
import com.team.blog.global.api.SuccessCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** 이웃 API 컨트롤러 */
@RestController
@RequestMapping("/api/neighbors")
@RequiredArgsConstructor
public class NeighborController {

    private final NeighborService neighborService;

    /**
     * 이웃 신청
     *
     * @param authentication JWT 인증 정보
     * @param request        신청 요청 DTO
     * @return 생성된 이웃 관계 정보
     */
    @PostMapping
    public ResponseEntity<ApiResponse<NeighborDetailResponse>> sendRequest(
            Authentication authentication,
            @RequestBody NeighborRequest request) {
        NeighborDetailResponse response = neighborService.sendRequest(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(SuccessCode.SUCCESS_CREATED, response));
    }

    /**
     * 이웃 신청 수락/거절
     *
     * @param authentication JWT 인증 정보
     * @param id             이웃 관계 id
     * @param request        상태 변경 요청 DTO
     * @return 변경된 이웃 관계 정보
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NeighborDetailResponse>> updateStatus(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody NeighborUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(neighborService.updateStatus(authentication.getName(), id, request)));
    }

    /**
     * 이웃 삭제
     *
     * @param authentication JWT 인증 정보
     * @param id             이웃 관계 id
     * @return 삭제된 이웃의 유저 정보
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<NeighborUserResponse>> delete(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(neighborService.delete(authentication.getName(), id)));
    }

    /**
     * 이웃 목록 조회
     *
     * @param authentication JWT 인증 정보
     * @return 이웃 유저 정보 목록
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<NeighborUserResponse>>> getNeighbors(
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(neighborService.getNeighbors(authentication.getName())));
    }

    /**
     * 받은 이웃 신청 목록 조회
     *
     * @param authentication JWT 인증 정보
     * @return 대기 중인 이웃 신청 목록
     */
    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<NeighborRequestResponse>>> getReceivedRequests(
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(neighborService.getReceivedRequests(authentication.getName())));
    }
}