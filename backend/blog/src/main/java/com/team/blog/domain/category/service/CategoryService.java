package com.team.blog.domain.category.service;

import com.team.blog.domain.board.repository.PostRepository;
import com.team.blog.domain.category.dto.request.CategoryCreateRequest;
import com.team.blog.domain.category.dto.request.CategoryUpdateRequest;
import com.team.blog.domain.category.dto.response.CategoryResponse;
import com.team.blog.domain.category.entity.Category;
import com.team.blog.domain.category.repository.CategoryRepository;
import com.team.blog.domain.user.repository.UserRepository;
import com.team.blog.global.api.ErrorCode;
import com.team.blog.global.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories(Long userId) {
        return categoryRepository.findByUserIdOrderByOrderNumAsc(userId)
                .stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional
    public CategoryResponse create(String loginId, CategoryCreateRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ApiException(ErrorCode.GLOBAL_INVALID_INPUT);
        }

        Long userId = resolveUserId(loginId);

        if (request.getParentId() != null) {
            categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ApiException(ErrorCode.CATEGORY_NOT_FOUND));
        }

        return CategoryResponse.from(categoryRepository.save(Category.of(userId, request)));
    }

    @Transactional
    public CategoryResponse update(String loginId, Long categoryId, CategoryUpdateRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ApiException(ErrorCode.GLOBAL_INVALID_INPUT);
        }

        Long userId = resolveUserId(loginId);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ApiException(ErrorCode.CATEGORY_NOT_FOUND));

        if (!category.getUserId().equals(userId)) {
            throw new ApiException(ErrorCode.CATEGORY_FORBIDDEN);
        }

        category.update(request.getName(), request.getOrderNum());
        return CategoryResponse.from(category);
    }

    @Transactional
    public void delete(String loginId, Long categoryId) {
        Long userId = resolveUserId(loginId);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ApiException(ErrorCode.CATEGORY_NOT_FOUND));

        if (!category.getUserId().equals(userId)) {
            throw new ApiException(ErrorCode.CATEGORY_FORBIDDEN);
        }

        List<Category> children = categoryRepository.findByParentId(categoryId);
        for (Category child : children) {
            postRepository.clearCategoryId(child.getId());
            categoryRepository.delete(child);
        }

        postRepository.clearCategoryId(categoryId);
        categoryRepository.delete(category);
    }

    private Long resolveUserId(String loginId) {
        return userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND))
                .getId();
    }
}