package com.team.blog.domain.neighbor.repository;

import com.team.blog.domain.neighbor.entity.Neighbor;
import com.team.blog.domain.neighbor.entity.NeighborStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/** 이웃 관계 레포지토리 */
public interface NeighborRepository extends JpaRepository<Neighbor, Long> {

    boolean existsByFromUserIdAndToUserId(Long fromUserId, Long toUserId);

    /** 특정 유저의 수락된 이웃 목록 (양방향) */
    @Query("SELECT n FROM Neighbor n WHERE (n.fromUserId = :userId OR n.toUserId = :userId) AND n.status = :status")
    List<Neighbor> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") NeighborStatus status);

    List<Neighbor> findByToUserIdAndStatus(Long toUserId, NeighborStatus status);
}