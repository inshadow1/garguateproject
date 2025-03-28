package org.example.stuff.controller;

import org.example.stuff.entity.Item;
import org.example.stuff.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;
import org.example.stuff.annotation.RequireRole;
import org.example.stuff.entity.UserRole;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/item")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class ItemController {
    
    @Autowired
    private ItemService itemService;
    
    @PostMapping("/create")
    @RequireRole({UserRole.ADMIN, UserRole.MEMBER})
    public Map<String, Object> createItem(@RequestBody Map<String, Object> params) {
        // 验证必填参数
        if (params.get("name") == null || params.get("categoryId") == null || 
            params.get("quantity") == null || params.get("userId") == null) {
            throw new RuntimeException("缺少必填参数");
        }
        
        // 验证参数不能为空字符串
        String name = (String) params.get("name");
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("名称不能为空");
        }
        
        Object categoryIdObj = params.get("categoryId");
        if (categoryIdObj == null || categoryIdObj.toString().trim().isEmpty()) {
            throw new RuntimeException("分类ID不能为空");
        }
        
        Object quantityObj = params.get("quantity");
        if (quantityObj == null || quantityObj.toString().trim().isEmpty()) {
            throw new RuntimeException("数量不能为空");
        }
        
        Object userIdObj = params.get("userId");
        if (userIdObj == null || userIdObj.toString().trim().isEmpty()) {
            throw new RuntimeException("用户ID不能为空");
        }
        
        // 安全地转换参数
        Long categoryId;
        Integer quantity;
        Long userId;
        Integer stockThreshold = null;
        Integer usageInterval = null;
        try {
            categoryId = Long.parseLong(categoryIdObj.toString().trim());
            quantity = Integer.parseInt(quantityObj.toString().trim());
            userId = Long.parseLong(userIdObj.toString().trim());
            
            // 处理可选的提醒参数
            if (params.get("stockThreshold") != null && !params.get("stockThreshold").toString().trim().isEmpty()) {
                stockThreshold = Integer.parseInt(params.get("stockThreshold").toString().trim());
            }
            if (params.get("usageInterval") != null && !params.get("usageInterval").toString().trim().isEmpty()) {
                usageInterval = Integer.parseInt(params.get("usageInterval").toString().trim());
            }
        } catch (NumberFormatException e) {
            throw new RuntimeException("参数格式错误：" + e.getMessage());
        }
        
        // 可选参数
        String location = (String) params.get("location");
        String description = (String) params.get("description");
        String imageUrl = (String) params.get("imageUrl");
        
        Item item = itemService.createItem(
            name,
            categoryId,
            quantity,
            location,
            description,
            imageUrl,
            userId,
            stockThreshold,
            usageInterval
        );
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "创建成功");
        result.put("item", item);
        return result;
    }
    
    @GetMapping("/list/{userId}")
    @RequireRole({UserRole.ADMIN, UserRole.MEMBER, UserRole.GUEST})
    public Map<String, Object> getUserItems(
            @PathVariable Long userId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Item> items = itemService.getUserItems(userId, categoryId, PageRequest.of(page, size));
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("items", items.getContent());
        result.put("total", items.getTotalElements());
        result.put("totalPages", items.getTotalPages());
        return result;
    }
    
    @PutMapping("/update/{itemId}")
    public Map<String, Object> updateItem(
            @PathVariable Long itemId,
            @RequestBody Map<String, Object> params) {
        Item item = itemService.updateItem(
            itemId,
            (String) params.get("name"),
            params.get("categoryId") != null ? Long.parseLong(params.get("categoryId").toString()) : null,
            params.get("quantity") != null ? Integer.parseInt(params.get("quantity").toString()) : null,
            (String) params.get("location"),
            (String) params.get("description"),
            (String) params.get("imageUrl"),
            Long.parseLong(params.get("userId").toString())
        );
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "更新成功");
        result.put("item", item);
        return result;
    }
    
    @DeleteMapping("/delete/{itemId}")
    @RequireRole({UserRole.ADMIN})
    public Map<String, Object> deleteItem(
            @PathVariable Long itemId,
            @RequestParam Long userId) {
        itemService.deleteItem(itemId, userId);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "删除成功");
        return result;
    }
    
    @GetMapping("/detail/{itemId}")
    public Map<String, Object> getItemDetail(
            @PathVariable Long itemId,
            @RequestParam Long userId) {
        return itemService.getItemDetail(itemId, userId);
    }
    
    @GetMapping("/search/{userId}")
    public Map<String, Object> searchItems(
            @PathVariable Long userId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        // 处理时间参数
        LocalDateTime startDateTime = null;
        LocalDateTime endDateTime = null;
        if (startTime != null && !startTime.isEmpty()) {
            startDateTime = LocalDateTime.parse(startTime);
        }
        if (endTime != null && !endTime.isEmpty()) {
            endDateTime = LocalDateTime.parse(endTime);
        }
        
        Page<Item> items = itemService.searchItems(
            userId,
            keyword,
            categoryId,
            location,
            startDateTime,
            endDateTime,
            PageRequest.of(page, size)
        );
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("items", items.getContent());
        result.put("total", items.getTotalElements());
        result.put("totalPages", items.getTotalPages());
        return result;
    }
    @GetMapping("/family/{familyId}/search")
    public Map<String, Object> searchFamilyItems(
            @PathVariable Long familyId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) LocalDateTime startTime,
            @RequestParam(required = false) LocalDateTime endTime,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<Item> items = itemService.searchFamilyItems(
            familyId,
            keyword,
            categoryId,
            location,
            startTime,
            endTime,
            PageRequest.of(page, size)
        );
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("items", items.getContent());
        result.put("total", items.getTotalElements());
        result.put("totalPages", items.getTotalPages());
        result.put("currentPage", items.getNumber());
        return result;
    }
    
    @PostMapping("/{itemId}/quantity")
    public Map<String, Object> updateQuantity(
            @PathVariable Long itemId,
            @RequestBody Map<String, Object> params) {
        // 验证参数
        if (params.get("amount") == null) {
            throw new RuntimeException("缺少必填参数：amount");
        }
        if (params.get("userId") == null) {
            throw new RuntimeException("缺少必填参数：userId");
        }
        
        Integer amount;
        try {
            amount = Integer.parseInt(params.get("amount").toString());
        } catch (NumberFormatException e) {
            throw new RuntimeException("amount 必须是整数");
        }
        
        Long userId = Long.parseLong(params.get("userId").toString());
        
        return itemService.updateQuantity(itemId, amount, userId);
    }
}