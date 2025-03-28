package org.example.stuff.controller;

import org.example.stuff.entity.User;
import org.example.stuff.entity.UserRole;
import org.example.stuff.service.UserService;
import org.example.stuff.annotation.RequireRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> params) {
        User user = userService.register(params.get("username"), params.get("password"));
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "注册成功");
        result.put("userId", user.getId());
        return result;
    }
    
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> params) {
        User user = userService.login(params.get("username"), params.get("password"));
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "登录成功");
        result.put("userId", user.getId());
        return result;
    }
    
    // 获取用户信息
    @GetMapping("/{userId}/profile")
    public Map<String, Object> getUserProfile(@PathVariable Long userId) {
        return userService.getUserProfile(userId);
    }
    
    // 更新用户基本信息
    @PutMapping("/{userId}/profile")
    public Map<String, Object> updateUserProfile(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> params) {
        return userService.updateUserProfile(userId, params);
    }
    
    // 修改密码
    @PutMapping("/{userId}/password")
    public Map<String, Object> updatePassword(
            @PathVariable Long userId,
            @RequestBody Map<String, String> params) {
        return userService.updatePassword(userId, params);
    }
    
    @PostMapping(value = "/{userId}/avatar", consumes = "multipart/form-data")
    public Map<String, Object> uploadAvatar(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("请选择要上传的图片");
        }
        
        // 检查文件类型
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("只能上传图片文件");
        }
        
        // 检查文件大小（最大 5MB）
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("图片大小不能超过 5MB");
        }
        
        try {
            // 生成文件名
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String filename = UUID.randomUUID().toString() + extension;
            
            // 保存文件
            String uploadDir = "uploads/avatars/";
            File dir = new File(uploadDir);
            if (!dir.exists() && !dir.mkdirs()) {
                throw new RuntimeException("创建上传目录失败");
            }
            
            File dest = new File(dir.getAbsolutePath() + File.separator + filename);
            file.transferTo(dest);
            
            // 生成访问URL
            String avatarUrl = "/api/uploads/avatars/" + filename;
            
            // 删除旧头像文件
            User user = userService.getUserById(userId);
            String oldAvatar = user.getAvatar();
            if (oldAvatar != null && oldAvatar.startsWith("/api/uploads/avatars/")) {
                String oldFilename = oldAvatar.substring("/api/uploads/avatars/".length());
                File oldFile = new File(uploadDir + oldFilename);
                if (oldFile.exists()) {
                    oldFile.delete();
                }
            }
            
            return userService.updateAvatar(userId, avatarUrl);
            
        } catch (IOException e) {
            throw new RuntimeException("文件上传失败", e);
        }
    }

    @PutMapping("/{userId}/role")
    @RequireRole(UserRole.ADMIN)
    public Map<String, Object> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> params) {
        if (params.get("adminId") == null || params.get("role") == null) {
            throw new RuntimeException("缺少必填参数");
        }
        
        Long adminId = Long.parseLong(params.get("adminId").toString());
        UserRole newRole = UserRole.valueOf(params.get("role").toString());
        
        return userService.updateUserRole(adminId, userId, newRole);
    }
} 