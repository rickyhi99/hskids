package com.team.blog.domain.neighbor.controller;

import com.team.blog.domain.neighbor.dto.request.NeighborRequest;
import com.team.blog.domain.neighbor.dto.request.NeighborUpdateRequest;
import com.team.blog.domain.neighbor.dto.response.NeighborDetailResponse;
import com.team.blog.domain.neighbor.dto.response.NeighborRequestResponse;
import com.team.blog.domain.neighbor.dto.response.NeighborStatusResponse;
import com.team.blog.domain.neighbor.dto.response.NeighborUserResponse;
import com.team.blog.domain.neighbor.service.NeighborService;
import com.team.blog.global.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
     * @param userId  신청하는 유저 id (X-User-Id 헤더)
     * @param request 신청 요청 DTO
     * @return 생성된 이웃 관계 정보
     */
    @PostMapping
    public ResponseEntity<ApiResponse<NeighborDetailResponse>> sendRequest(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody NeighborRequest request) {
        return ResponseEntity.ok(ApiResponse.success(neighborService.sendRequest(userId, request)));
    }

    /**
     * 이웃 신청 수락/거절
     *
     * @param userId  수신자 유저 id (X-User-Id 헤더)
     * @param id      이웃 관계 id
     * @param request 상태 변경 요청 DTO
     * @return 변경된 이웃 관계 정보
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NeighborDetailResponse>> updateStatus(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @RequestBody NeighborUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(neighborService.updateStatus(userId, id, request)));
    }

    /**
     * 이웃 삭제
     *
     * @param userId 요청 유저 id (X-User-Id 헤더)
     * @param id     이웃 관계 id
     * @return 삭제된 이웃의 유저 정보
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<NeighborUserResponse>> delete(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(neighborService.delete(userId, id)));
    }

    /**
     * 이웃 목록 조회
     *
     * @param userId 요청 유저 id (X-User-Id 헤더)
     * @return 이웃 유저 정보 목록
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<NeighborUserResponse>>> getNeighbors(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(ApiResponse.success(neighborService.getNeighbors(userId)));
    }

    /**
     * 특정 유저와의 이웃 관계 상태 조회
     */
    @GetMapping("/status/{targetUserId}")
    public ResponseEntity<ApiResponse<NeighborStatusResponse>> getStatus(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long targetUserId) {
        return ResponseEntity.ok(ApiResponse.success(neighborService.getStatusWith(userId, targetUserId)));
    }

    /**
     * 받은 이웃 신청 목록 조회
     *
     * @param userId 수신자 유저 id (X-User-Id 헤더)
     * @return 대기 중인 이웃 신청 목록
     */
    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<NeighborRequestResponse>>> getReceivedRequests(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(ApiResponse.success(neighborService.getReceivedRequests(userId)));
    }
}