package org.example.stuff.controller;

import org.example.stuff.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000"}, allowCredentials = "true")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    // 用户管理接口
    @GetMapping("/users")
    public Map<String, Object> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return adminService.listUsers(page, size, keyword);
    }
    
    @PostMapping("/users")
    public Map<String, Object> createUser(@RequestBody Map<String, String> params) {
        return adminService.createUser(params);
    }
    
    @PutMapping("/users/{userId}")
    public Map<String, Object> updateUser(
            @PathVariable Long userId,
            @RequestBody Map<String, String> params) {
        return adminService.updateUser(userId, params);
    }
    
    @DeleteMapping("/users/{userId}")
    public Map<String, Object> deleteUser(@PathVariable Long userId) {
        return adminService.deleteUser(userId);
    }
    
    // 家庭组管理接口
    @PostMapping("/families")
    public Map<String, Object> createFamily(@RequestBody Map<String, Object> params) {
        return adminService.createFamily(params);
    }
    
    @GetMapping("/families")
    public Map<String, Object> listFamilies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return adminService.listFamilies(page, size);
    }
    
    @GetMapping("/families/{familyId}/members")
    public Map<String, Object> listFamilyMembers(@PathVariable Long familyId) {
        return adminService.listFamilyMembers(familyId);
    }
    
    @PostMapping("/families/{familyId}/members")
    public Map<String, Object> addMember(
            @PathVariable Long familyId,
            @RequestBody Map<String, Object> params) {
        return adminService.addMember(
            familyId,
            Long.parseLong(params.get("userId").toString()),
            (String) params.get("role")
        );
    }
    
    @PutMapping("/families/{familyId}/members/{memberId}/role")
    public Map<String, Object> updateFamilyMemberRole(
            @PathVariable Long familyId,
            @PathVariable Long memberId,
            @RequestBody Map<String, Object> params) {
        if (params.get("adminId") == null || params.get("role") == null) {
            throw new RuntimeException("缺少必要参数");
        }
        
        Long adminId = Long.parseLong(params.get("adminId").toString());
        String role = params.get("role").toString();
        
        return adminService.updateFamilyMemberRole(adminId, familyId, memberId, role);
    }
    
    @DeleteMapping("/families/{familyId}/members/{userId}")
    public Map<String, Object> removeMember(
            @PathVariable Long familyId,
            @PathVariable Long userId) {
        return adminService.removeMember(familyId, userId);
    }
    
    @PostMapping("/families/{familyId}/delete")
    public Map<String, Object> deleteFamilyPost(
            @PathVariable Long familyId,
            @RequestParam Long userId) {
        return adminService.deleteFamily(familyId, userId);
    }
    
    @DeleteMapping("/families/{familyId}")
    public Map<String, Object> deleteFamily(
            @PathVariable Long familyId,
            @RequestBody Map<String, Object> params) {
        Long userId = Long.parseLong(params.get("userId").toString());
        return adminService.deleteFamily(familyId, userId);
    }
} 