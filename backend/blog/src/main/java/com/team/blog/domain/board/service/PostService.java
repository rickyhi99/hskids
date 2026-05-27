package com.team.blog.domain.board.service;

import com.team.blog.domain.board.dto.request.PostCreateRequest;
import com.team.blog.domain.board.dto.request.PostUpdateRequest;
import com.team.blog.domain.board.dto.response.PageResponse;
import com.team.blog.domain.board.dto.response.PostResponse;
import com.team.blog.domain.board.entity.Post;
import com.team.blog.domain.board.entity.PostLike;
import com.team.blog.domain.board.entity.Visibility;
import com.team.blog.domain.board.repository.CommentRepository;
import com.team.blog.domain.board.repository.PostLikeRepository;
import com.team.blog.domain.board.repository.PostRepository;
import com.team.blog.domain.user.entity.UserEntity;
import com.team.blog.domain.user.repository.UserRepository;
import com.team.blog.global.api.ErrorCode;
import com.team.blog.global.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    @Transactional
    public PostResponse create(Long userId, PostCreateRequest request) {
        Post post = new Post(userId, request);
        postRepository.save(post);
        return toResponse(post);
    }

    @Transactional
    public PostResponse update(Long userId, Long postId, PostUpdateRequest request) {
        Post post = getPostOrThrow(postId);
        validateOwner(post, userId);
        post.update(request);
        return toResponse(post);
    }

    @Transactional
    public void delete(Long userId, Long postId) {
        Post post = getPostOrThrow(postId);
        validateOwner(post, userId);
        postLikeRepository.deleteAllByPostId(postId);
        commentRepository.deleteAllByPostId(postId);
        postRepository.delete(post);
    }

    public List<PostResponse> getAll() {
        return postRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public PageResponse<PostResponse> getPosts(String search, Pageable pageable) {
        if (search == null || search.isBlank()) {
            return PageResponse.from(postRepository.findPostsPage(null, null, pageable).map(this::toResponse));
        }
        String s = "%" + search.trim().toLowerCase() + "%";
        return PageResponse.from(postRepository.searchPosts(s, s, s, null, null, pageable).map(this::toResponse));
    }

    public PageResponse<PostResponse> getUserPosts(Long userId, String search, Long categoryId, Pageable pageable) {
        if (search == null || search.isBlank()) {
            return PageResponse.from(postRepository.findPostsPage(userId, categoryId, pageable).map(this::toResponse));
        }
        String s = "%" + search.trim().toLowerCase() + "%";
        return PageResponse.from(postRepository.searchPosts(s, s, s, userId, categoryId, pageable).map(this::toResponse));
    }

    public PostResponse getOne(Long postId) {
        return toResponse(getPostOrThrow(postId));
    }

    public List<PostResponse> getPopular() {
        return postRepository.findAllByVisibilityOrderByLikeCountDesc(Visibility.PUBLIC).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<PostResponse> getMyPosts(Long userId) {
        return postRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<PostResponse> getUserPosts(Long userId) {
        return postRepository.findAllByUserIdAndVisibilityOrderByCreatedAtDesc(userId, Visibility.PUBLIC).stream()
                .map(this::toResponse)
                .toList();
    }

    public Set<Long> getLikedPostIds(Long userId) {
        return postLikeRepository.findAllByUserId(userId).stream()
                .map(PostLike::getPostId)
                .collect(Collectors.toSet());
    }

    @Transactional
    public void like(Long userId, Long postId) {
        if (postLikeRepository.existsByUserIdAndPostId(userId, postId)) {
            throw new ApiException(ErrorCode.POST_LIKE_ALREADY_EXISTS);
        }
        Post post = getPostOrThrow(postId);
        postLikeRepository.save(new PostLike(userId, postId));
        post.increaseLikeCount();
    }

    @Transactional
    public void unlike(Long userId, Long postId) {
        PostLike postLike = postLikeRepository.findByUserIdAndPostId(userId, postId)
                .orElseThrow(() -> new ApiException(ErrorCode.POST_LIKE_NOT_FOUND));
        Post post = getPostOrThrow(postId);
        postLikeRepository.delete(postLike);
        post.decreaseLikeCount();
    }

    private PostResponse toResponse(Post post) {
        UserEntity user = userRepository.findById(post.getUserId()).orElse(null);
        String nickname = user != null ? user.getNickname() : null;
        String profileImg = user != null ? user.getProfileImg() : null;
        return new PostResponse(post, nickname, profileImg);
    }

    private Post getPostOrThrow(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ApiException(ErrorCode.POST_NOT_FOUND));
    }

    private void validateOwner(Post post, Long userId) {
        if (!post.getUserId().equals(userId)) {
            throw new ApiException(ErrorCode.POST_FORBIDDEN);
        }
    }
}
