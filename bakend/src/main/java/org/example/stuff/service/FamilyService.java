package org.example.stuff.service;

import org.example.stuff.entity.*;
import org.example.stuff.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;

@Service
public class FamilyService {
    
    @Autowired
    private FamilyRepository familyRepository;
    
    @Autowired
    private FamilyMemberRepository familyMemberRepository;
    
    @Autowired
    private InvitationRepository invitationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EntityManager entityManager;
    
    @Transactional
    public Map<String, Object> inviteMember(Long familyId, Long inviterId, Long inviteeId) {
        // 验证家庭组是否存在
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new RuntimeException("家庭组不存在"));
        
        // 验证邀请人是否存在且是否是家庭组成员
        User inviter = userRepository.findById(inviterId)
                .orElseThrow(() -> new RuntimeException("邀请人不存在"));
                
        FamilyMember inviterMember = familyMemberRepository
                .findByFamilyIdAndUserId(familyId, inviterId)
                .orElseThrow(() -> new RuntimeException("邀请人不是该家庭组成员"));
                
        // 验证邀请人是否有权限邀请（必须是管理员）
        if (inviterMember.getRole() != FamilyMemberRole.ADMIN) {
            throw new RuntimeException("没有权限邀请新成员");
        }
        
        // 验证被邀请者是否存在
        User invitee = userRepository.findById(inviteeId)
                .orElseThrow(() -> new RuntimeException("被邀请用户不存在"));
        
        // 检查是否已经是成员
        if (familyMemberRepository.findByFamilyIdAndUserId(familyId, inviteeId).isPresent()) {
            throw new RuntimeException("用户已经是家庭组成员");
        }
        
        // 创建邀请
        Invitation invitation = new Invitation();
        invitation.setFamily(family);
        invitation.setInviter(inviter);
        invitation.setInvitee(invitee);
        invitation.setCode(UUID.randomUUID().toString());
        invitation = invitationRepository.save(invitation);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "邀请发送成功");
        result.put("invitationCode", invitation.getCode());
        return result;
    }
    
    @Transactional
    public Map<String, Object> acceptInvitation(String code, Long userId) {
        // 查找并验证邀请
        Invitation invitation = invitationRepository.findByCodeAndUsedFalse(code)
                .orElseThrow(() -> new RuntimeException("邀请无效或已使用"));
                
        if (invitation.getExpireTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("邀请已过期");
        }
        
        if (!invitation.getInvitee().getId().equals(userId)) {
            throw new RuntimeException("此邀请不是发给你的");
        }
        
        // 创建家庭组成员
        FamilyMember member = new FamilyMember();
        member.setFamily(invitation.getFamily());
        member.setUser(invitation.getInvitee());
        member.setRole(FamilyMemberRole.MEMBER);
        familyMemberRepository.save(member);
        
        // 标记邀请为已使用
        invitation.setUsed(true);
        invitationRepository.save(invitation);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "成功加入家庭组");
        return result;
    }
    
    public Map<String, Object> getUserInvitations(Long userId) {
        List<Invitation> invitations = invitationRepository
            .findByInviteeIdAndUsedFalseAndExpireTimeAfter(userId, LocalDateTime.now());
            
        List<Map<String, Object>> invitationList = invitations.stream()
            .map(inv -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", inv.getId());
                map.put("familyId", inv.getFamily().getId());
                map.put("familyName", inv.getFamily().getName());
                map.put("inviter", inv.getInviter().getUsername());
                map.put("code", inv.getCode());
                map.put("expireTime", inv.getExpireTime());
                return map;
            })
            .collect(Collectors.toList());
            
        Map<String, Object> result = new HashMap<>();
        result.put("invitations", invitationList);
        return result;
    }
    
    @Transactional
    public Map<String, Object> createFamily(Map<String, Object> params) {
        // 验证创建者是否存在
        User creator = userRepository.findById(Long.parseLong(params.get("creatorId").toString()))
                .orElseThrow(() -> new RuntimeException("创建者不存在"));
        
        // 创建家庭组
        Family family = new Family();
        family.setName((String) params.get("name"));
        family.setDescription((String) params.get("description"));
        family.setCreator(creator);
        family = familyRepository.save(family);
        
        // 创建者成为家庭组的第一个成员（管理员）
        FamilyMember member = new FamilyMember();
        member.setFamily(family);
        member.setUser(creator);
        member.setRole(FamilyMemberRole.ADMIN);
        familyMemberRepository.save(member);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "创建成功");
        result.put("familyId", family.getId());
        return result;
    }
    
    public Map<String, Object> getUserFamilies(Long userId) {
        // 获取用户所有的家庭组成员关系
        List<FamilyMember> memberships = familyMemberRepository.findByUserId(userId);
        
        // 转换为前端需要的格式
        List<Map<String, Object>> families = memberships.stream()
            .map(member -> {
                Map<String, Object> map = new HashMap<>();
                Family family = member.getFamily();
                map.put("id", family.getId());
                map.put("name", family.getName());
                map.put("description", family.getDescription());
                map.put("role", member.getRole());
                map.put("createTime", family.getCreateTime());
                map.put("creator", family.getCreator().getUsername());
                return map;
            })
            .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("families", families);
        return result;
    }
    
    public Map<String, Object> getFamilyMembers(Long familyId) {
        List<FamilyMember> members = familyMemberRepository.findByFamilyId(familyId);
        
        List<Map<String, Object>> memberList = members.stream()
            .map(member -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", member.getId());
                map.put("userId", member.getUser().getId());
                map.put("username", member.getUser().getUsername());
                map.put("role", member.getRole());
                map.put("joinTime", member.getJoinTime());
                return map;
            })
            .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("members", memberList);
        return result;
    }
    
    @Transactional
    public Map<String, Object> updateFamilyMemberRole(Long familyId, Long memberId, String roleStr) {
        // 验证家庭是否存在
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new RuntimeException("家庭不存在"));
                
        // 验证成员是否存在
        FamilyMember member = familyMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("成员不存在"));
                
        // 验证成员是否属于该家庭
        if (!member.getFamily().getId().equals(familyId)) {
            throw new RuntimeException("该成员不属于此家庭");
        }
        
        // 更新角色
        try {
            FamilyMemberRole newRole = FamilyMemberRole.valueOf(roleStr);
            member.setRole(newRole);
            member = familyMemberRepository.saveAndFlush(member);
            
            // 刷新成员对象
            entityManager.refresh(member);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "角色更新成功");
            result.put("newRole", member.getRole().name());
            return result;
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("无效的角色值");
        }
    }
    
    // ... 其他方法 ...
} 