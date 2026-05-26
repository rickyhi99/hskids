package com.team.blog.domain.category.controller;

import com.team.blog.domain.category.dto.request.CategoryCreateRequest;
import com.team.blog.domain.category.dto.request.CategoryUpdateRequest;
import com.team.blog.domain.category.dto.response.CategoryResponse;
import com.team.blog.domain.category.service.CategoryService;
import com.team.blog.global.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /** 유저 카테고리 목록 조회 */
    @GetMapping("/api/users/{id}/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategories(id)));
    }

    /** 카테고리 생성 */
    @PostMapping("/api/categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            Authentication authentication,
            @RequestBody CategoryCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.create(authentication.getName(), request)));
    }

    /** 카테고리 수정 */
    @PutMapping("/api/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody CategoryUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.update(authentication.getName(), id, request)));
    }

    /** 카테고리 삭제 */
    @DeleteMapping("/api/categories/{id}")
    public ResponseEntity<Void> delete(
            Authentication authentication,
            @PathVariable Long id) {
        categoryService.delete(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}