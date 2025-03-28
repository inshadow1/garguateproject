package org.example.stuff.controller;

import org.example.stuff.entity.Category;
import org.example.stuff.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/category")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class CategoryController {
    
    @Autowired
    private CategoryService categoryService;
    
    @PostMapping("/create")
    public Map<String, Object> createCategory(@RequestBody Map<String, Object> params) {
        Category category = categoryService.createCategory(
            (String) params.get("name"),
            (String) params.get("description"),
            Long.parseLong(params.get("userId").toString())
        );
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "创建成功");
        result.put("category", category);
        return result;
    }
    
    @GetMapping("/list/{userId}")
    public Map<String, Object> getUserCategories(@PathVariable Long userId) {
        List<Category> categories = categoryService.getUserCategories(userId);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("categories", categories);
        return result;
    }
    
    @PutMapping("/update/{categoryId}")
    public Map<String, Object> updateCategory(
            @PathVariable Long categoryId,
            @RequestBody Map<String, Object> params) {
        Category category = categoryService.updateCategory(
            categoryId,
            (String) params.get("name"),
            (String) params.get("description"),
            Long.parseLong(params.get("userId").toString())
        );
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "更新成功");
        result.put("category", category);
        return result;
    }
    
    @DeleteMapping("/delete/{categoryId}")
    public Map<String, Object> deleteCategory(
            @PathVariable Long categoryId,
            @RequestParam Long userId) {
        categoryService.deleteCategory(categoryId, userId);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "删除成功");
        return result;
    }
} 