package org.example.stuff.service;

import org.example.stuff.entity.Category;
import org.example.stuff.entity.User;
import org.example.stuff.repository.CategoryRepository;
import org.example.stuff.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Category createCategory(String name, String description, Long userId) {
        // 检查分类名是否已存在
        if (categoryRepository.existsByNameAndUserId(name, userId)) {
            throw new RuntimeException("该分类名已存在");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setUser(user);
        
        return categoryRepository.save(category);
    }
    
    public List<Category> getUserCategories(Long userId) {
        return categoryRepository.findByUserId(userId);
    }
    
    public Category updateCategory(Long categoryId, String name, String description, Long userId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("分类不存在"));
        
        // 验证是否是该用户的分类
        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权限修改此分类");
        }
        
        // 如果名称变更，检查新名称是否已存在
        if (!category.getName().equals(name) && categoryRepository.existsByNameAndUserId(name, userId)) {
            throw new RuntimeException("该分类名已存在");
        }
        
        category.setName(name);
        category.setDescription(description);
        return categoryRepository.save(category);
    }
    
    public void deleteCategory(Long categoryId, Long userId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("分类不存在"));
        
        // 验证是否是该用户的分类
        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权限删除此分类");
        }
        
        categoryRepository.delete(category);
    }
} 