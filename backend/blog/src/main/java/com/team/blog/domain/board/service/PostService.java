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
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;

    @Transactional
    public PostResponse create(Long userId, PostCreateRequest request) {
        Post post = new Post(userId, request);
        postRepository.save(post);
        return new PostResponse(post);
    }

    @Transactional
    public PostResponse update(Long userId, Long postId, PostUpdateRequest request) {
        Post post = getPostOrThrow(postId);
        validateOwner(post, userId);
        post.update(request);
        return new PostResponse(post);
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
                .map(PostResponse::new)
                .toList();
    }

    public PageResponse<PostResponse> getPosts(String search, Pageable pageable) {
        if (search == null || search.isBlank()) {
            return PageResponse.from(postRepository.findPostsPage(null, null, pageable).map(PostResponse::new));
        }
        String s = "%" + search.trim().toLowerCase() + "%";
        return PageResponse.from(postRepository.searchPosts(s, s, s, null, null, pageable).map(PostResponse::new));
    }

    public PageResponse<PostResponse> getUserPosts(Long userId, String search, Long categoryId, Pageable pageable) {
        if (search == null || search.isBlank()) {
            return PageResponse.from(postRepository.findPostsPage(userId, categoryId, pageable).map(PostResponse::new));
        }
        String s = "%" + search.trim().toLowerCase() + "%";
        return PageResponse.from(postRepository.searchPosts(s, s, s, userId, categoryId, pageable).map(PostResponse::new));
    }

    public PostResponse getOne(Long postId) {
        return new PostResponse(getPostOrThrow(postId));
    }

    public List<PostResponse> getPopular() {
        return postRepository.findAllByVisibilityOrderByLikeCountDesc(Visibility.PUBLIC).stream()
                .map(PostResponse::new)
                .toList();
    }

    @Transactional
    public void like(Long userId, Long postId) {
        if (postLikeRepository.existsByUserIdAndPostId(userId, postId)) {
            throw new IllegalArgumentException("이미 좋아요를 눌렀습니다.");
        }
        Post post = getPostOrThrow(postId);
        postLikeRepository.save(new PostLike(userId, postId));
        post.increaseLikeCount();
    }

    @Transactional
    public void unlike(Long userId, Long postId) {
        PostLike postLike = postLikeRepository.findByUserIdAndPostId(userId, postId)
                .orElseThrow(() -> new IllegalArgumentException("좋아요를 누르지 않은 게시글입니다."));
        Post post = getPostOrThrow(postId);
        postLikeRepository.delete(postLike);
        post.decreaseLikeCount();
    }

    private Post getPostOrThrow(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다. id=" + postId));
    }

    private void validateOwner(Post post, Long userId) {
        if (!post.getUserId().equals(userId)) {
            throw new IllegalArgumentException("본인의 게시글만 수정/삭제할 수 있습니다.");
        }
    }
}