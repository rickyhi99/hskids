package com.team.blog.test;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class TestController {

    private final TestRepository testRepository;

    @GetMapping("/save")
    public TestEntity save(@RequestParam String message) {
        return testRepository.save(new TestEntity(message));
    }

    @GetMapping
    public List<TestEntity> findAll() {
        return testRepository.findAll();
    }
}
