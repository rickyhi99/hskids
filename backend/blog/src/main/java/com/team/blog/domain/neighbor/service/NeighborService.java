package com.team.blog.domain.neighbor.service;

import com.team.blog.domain.neighbor.dto.request.NeighborRequest;
import com.team.blog.domain.neighbor.dto.request.NeighborUpdateRequest;
import com.team.blog.domain.neighbor.dto.response.NeighborDetailResponse;
import com.team.blog.domain.neighbor.dto.response.NeighborRequestResponse;
import com.team.blog.domain.neighbor.dto.response.NeighborStatusResponse;
import com.team.blog.domain.neighbor.dto.response.NeighborUserResponse;
import com.team.blog.domain.neighbor.entity.Neighbor;
import com.team.blog.domain.neighbor.entity.NeighborStatus;
import com.team.blog.domain.neighbor.repository.NeighborRepository;
import com.team.blog.domain.user.entity.UserEntity;
import com.team.blog.domain.user.repository.UserRepository;
import com.team.blog.global.api.ErrorCode;
import com.team.blog.global.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** 이웃 관련 비즈니스 로직 */
@Service
@RequiredArgsConstructor
public class NeighborService {

    private final NeighborRepository neighborRepository;
    private final UserRepository userRepository;

    /**
     * 이웃 신청
     *
     * @param loginId JWT에서 추출한 로그인 아이디
     * @param request 신청 요청 DTO
     * @return 생성된 이웃 관계 정보
     */
    @Transactional
    public NeighborDetailResponse sendRequest(String loginId, NeighborRequest request) {
        Long fromUserId = resolveUserId(loginId);
        Long toUserId = request.getToUserId();

        if (fromUserId.equals(toUserId)) {
            throw new ApiException(ErrorCode.SELF_NEIGHBOR_REQUEST);
        }

        if (neighborRepository.existsByFromUserIdAndToUserId(fromUserId, toUserId) ||
                neighborRepository.existsByFromUserIdAndToUserId(toUserId, fromUserId)) {
            throw new ApiException(ErrorCode.NEIGHBOR_ALREADY_EXISTS);
        }

        return NeighborDetailResponse.from(neighborRepository.save(Neighbor.of(fromUserId, toUserId)));
    }

    /**
     * 이웃 신청 수락/거절 — 거절 시 row 삭제
     *
     * @param loginId    JWT에서 추출한 로그인 아이디
     * @param neighborId 이웃 관계 id
     * @param request    상태 변경 요청 DTO
     * @return 변경된 이웃 관계 정보
     */
    @Transactional
    public NeighborDetailResponse updateStatus(String loginId, Long neighborId, NeighborUpdateRequest request) {
        Long userId = resolveUserId(loginId);
        Neighbor neighbor = neighborRepository.findById(neighborId)
                .orElseThrow(() -> new ApiException(ErrorCode.NEIGHBOR_NOT_FOUND));

        if (!neighbor.getToUserId().equals(userId)) {
            throw new ApiException(ErrorCode.NEIGHBOR_WITHDRAWN);
        }

        if (request.getStatus() == NeighborStatus.REJECTED) {
            NeighborDetailResponse response = NeighborDetailResponse.rejected(neighbor);
            neighborRepository.delete(neighbor);
            return response;
        }

        neighbor.accept();
        return NeighborDetailResponse.from(neighbor);
    }

    /**
     * 이웃 삭제
     *
     * @param loginId    JWT에서 추출한 로그인 아이디
     * @param neighborId 이웃 관계 id
     * @return 삭제된 이웃의 유저 정보
     */
    @Transactional
    public NeighborUserResponse delete(String loginId, Long neighborId) {
        Long userId = resolveUserId(loginId);
        Neighbor neighbor = neighborRepository.findById(neighborId)
                .orElseThrow(() -> new ApiException(ErrorCode.NEIGHBOR_NOT_FOUND));

        if (!neighbor.getFromUserId().equals(userId) && !neighbor.getToUserId().equals(userId)) {
            throw new ApiException(ErrorCode.NEIGHBOR_WITHDRAWN);
        }

        Long otherUserId = neighbor.getFromUserId().equals(userId)
                ? neighbor.getToUserId()
                : neighbor.getFromUserId();

        UserEntity otherUserEntity = userRepository.findById(otherUserId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        neighborRepository.delete(neighbor);
        return NeighborUserResponse.of(neighborId, otherUserEntity);
    }

    /**
     * 이웃 목록 조회
     *
     * @param loginId JWT에서 추출한 로그인 아이디
     * @return 수락된 이웃 유저 정보 목록
     */
    @Transactional(readOnly = true)
    public List<NeighborUserResponse> getNeighbors(String loginId) {
        Long userId = resolveUserId(loginId);
        return neighborRepository.findByUserIdAndStatus(userId, NeighborStatus.ACCEPTED)
                .stream()
                .map(neighbor -> {
                    Long otherUserId = neighbor.getFromUserId().equals(userId)
                            ? neighbor.getToUserId()
                            : neighbor.getFromUserId();
                    UserEntity otherUserEntity = userRepository.findById(otherUserId)
                            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
                    return NeighborUserResponse.of(neighbor.getId(), otherUserEntity);
                })
                .toList();
    }

    /**
     * 두 유저 사이의 이웃 관계 상태 조회
     *
     * @param myId       현재 유저 id
     * @param targetId   상대 유저 id
     * @return 관계 상태 (NONE / PENDING_SENT / PENDING_RECEIVED / ACCEPTED)
     */
    @Transactional(readOnly = true)
    public NeighborStatusResponse getStatusWith(Long myId, Long targetId) {
        // 내가 보낸 요청
        var sent = neighborRepository.findByFromUserIdAndToUserId(myId, targetId);
        if (sent.isPresent()) {
            Neighbor n = sent.get();
            String status = n.getStatus() == NeighborStatus.ACCEPTED ? "ACCEPTED" : "PENDING_SENT";
            return new NeighborStatusResponse(status, n.getId());
        }
        // 상대가 보낸 요청
        var received = neighborRepository.findByFromUserIdAndToUserId(targetId, myId);
        if (received.isPresent()) {
            Neighbor n = received.get();
            String status = n.getStatus() == NeighborStatus.ACCEPTED ? "ACCEPTED" : "PENDING_RECEIVED";
            return new NeighborStatusResponse(status, n.getId());
        }
        return new NeighborStatusResponse("NONE", null);
    }

    /**
     * 받은 이웃 신청 목록 조회
     *
     * @param loginId JWT에서 추출한 로그인 아이디
     * @return 대기 중인 이웃 신청 목록
     */
    @Transactional(readOnly = true)
    public List<NeighborRequestResponse> getReceivedRequests(String loginId) {
        Long userId = resolveUserId(loginId);
        return neighborRepository.findByToUserIdAndStatus(userId, NeighborStatus.PENDING)
                .stream()
                .map(neighbor -> {
                    UserEntity fromUserEntity = userRepository.findById(neighbor.getFromUserId())
                            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
                    return NeighborRequestResponse.of(neighbor, fromUserEntity);
                })
                .toList();
    }

    private Long resolveUserId(String loginId) {
        return userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND))
                .getId();
    }
}