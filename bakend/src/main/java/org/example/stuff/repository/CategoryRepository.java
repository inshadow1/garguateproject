package org.example.stuff.repository;

import org.example.stuff.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserId(Long userId);
    boolean existsByNameAndUserId(String name, Long userId);
} 