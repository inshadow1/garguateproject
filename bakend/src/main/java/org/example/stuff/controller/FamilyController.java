package org.example.stuff.controller;

import org.example.stuff.service.FamilyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/family")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000"}, allowCredentials = "true")
public class FamilyController {
    
    @Autowired
    private FamilyService familyService;
    
    // 创建家庭组
    @PostMapping
    public Map<String, Object> createFamily(@RequestBody Map<String, Object> params) {
        return familyService.createFamily(params);
    }
    
    // 获取用户的家庭组列表
    @GetMapping("/user/{userId}")
    public Map<String, Object> getUserFamilies(@PathVariable Long userId) {
        return familyService.getUserFamilies(userId);
    }
    
    // 邀请成员
    @PostMapping("/{familyId}/invite")
    public Map<String, Object> inviteMember(
            @PathVariable Long familyId,
            @RequestBody Map<String, Object> params) {
        return familyService.inviteMember(
            familyId,
            Long.parseLong(params.get("inviterId").toString()),
            Long.parseLong(params.get("inviteeId").toString())
        );
    }
    
    // 接受邀请
    @PostMapping("/invitation/{code}/accept")
    public Map<String, Object> acceptInvitation(
            @PathVariable String code,
            @RequestParam Long userId) {
        return familyService.acceptInvitation(code, userId);
    }
    
    // 获取家庭组成员列表
    @GetMapping("/{familyId}/members")
    public Map<String, Object> getFamilyMembers(@PathVariable Long familyId) {
        return familyService.getFamilyMembers(familyId);
    }
    
    // 获取用户收到的邀请
    @GetMapping("/invitations/{userId}")
    public Map<String, Object> getUserInvitations(@PathVariable Long userId) {
        return familyService.getUserInvitations(userId);
    }
    
    // 更新家庭成员角色
    @PutMapping("/families/{familyId}/members/{memberId}/role")
    public Map<String, Object> updateFamilyMemberRole(
            @PathVariable Long familyId,
            @PathVariable Long memberId,
            @RequestBody Map<String, String> params) {
        if (!params.containsKey("role")) {
            throw new RuntimeException("缺少角色参数");
        }
        return familyService.updateFamilyMemberRole(familyId, memberId, params.get("role"));
    }
} 