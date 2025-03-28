package org.example.stuff.controller;

import org.example.stuff.entity.Favorite;
import org.example.stuff.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/favorite")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class FavoriteController {
    
    @Autowired
    private FavoriteService favoriteService;
    
    @PostMapping("/add")
    public Map<String, Object> addFavorite(@RequestBody Map<String, Object> params) {
        Favorite favorite = favoriteService.addFavorite(
            Long.parseLong(params.get("itemId").toString()),
            Long.parseLong(params.get("userId").toString())
        );
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "收藏成功");
        result.put("favorite", favorite);
        return result;
    }
    
    @GetMapping("/list/{userId}")
    public Map<String, Object> getUserFavorites(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Favorite> favorites = favoriteService.getUserFavorites(userId, PageRequest.of(page, size));
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("favorites", favorites.getContent());
        result.put("total", favorites.getTotalElements());
        result.put("totalPages", favorites.getTotalPages());
        return result;
    }
    
    @DeleteMapping("/remove")
    public Map<String, Object> removeFavorite(
            @RequestParam Long itemId,
            @RequestParam Long userId) {
        favoriteService.removeFavorite(itemId, userId);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "取消收藏成功");
        return result;
    }
    
    @GetMapping("/check")
    public Map<String, Object> checkFavorite(
            @RequestParam Long itemId,
            @RequestParam Long userId) {
        boolean isFavorite = favoriteService.isFavorite(itemId, userId);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("isFavorite", isFavorite);
        return result;
    }
} 