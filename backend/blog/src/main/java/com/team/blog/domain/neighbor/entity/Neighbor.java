package com.team.blog.domain.neighbor.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** 이웃 관계 엔티티 */
@Entity
@Table(name = "neighbors", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"from_user_id", "to_user_id"})
})
@Getter
@NoArgsConstructor
public class Neighbor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "from_user_id", nullable = false)
    private Long fromUserId;

    @Column(name = "to_user_id", nullable = false)
    private Long toUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NeighborStatus status;

    private LocalDateTime createdAt;

    /**
     * 이웃 신청 생성
     *
     * @param fromUserId 신청한 유저 id
     * @param toUserId   신청 받은 유저 id
     * @return 새 Neighbor 인스턴스
     */
    public static Neighbor of(Long fromUserId, Long toUserId) {
        Neighbor neighbor = new Neighbor();
        neighbor.fromUserId = fromUserId;
        neighbor.toUserId = toUserId;
        neighbor.status = NeighborStatus.PENDING;
        return neighbor;
    }

    /** 이웃 신청 수락 */
    public void accept() {
        this.status = NeighborStatus.ACCEPTED;
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}