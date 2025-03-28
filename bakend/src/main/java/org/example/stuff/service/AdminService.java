package org.example.stuff.service;

import org.example.stuff.entity.*;
import org.example.stuff.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FamilyRepository familyRepository;
    
    @Autowired
    private FamilyMemberRepository familyMemberRepository;
    
    @Autowired
    private InvitationRepository invitationRepository;
    
    // 用户管理方法
    public Map<String, Object> listUsers(int page, int size, String keyword) {
        Page<User> users;
        if (keyword != null && !keyword.trim().isEmpty()) {
            // 如果需要搜索，需要在UserRepository中添加相应的方法
            users = userRepository.findByUsernameContaining(keyword, PageRequest.of(page, size));
        } else {
            users = userRepository.findAll(PageRequest.of(page, size));
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("users", users.getContent());
        result.put("total", users.getTotalElements());
        result.put("totalPages", users.getTotalPages());
        return result;
    }
    
    public Map<String, Object> createUser(Map<String, String> params) {
        // 验证用户名是否已存在
        if (userRepository.findByUsername(params.get("username")) != null) {
            throw new RuntimeException("用户名已存在");
        }
        
        User user = new User();
        user.setUsername(params.get("username"));
        user.setPassword(params.get("password"));
        user = userRepository.save(user);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "创建成功");
        result.put("userId", user.getId());
        return result;
    }
    
    public Map<String, Object> updateUser(Long userId, Map<String, String> params) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        if (params.containsKey("username")) {
            User existingUser = userRepository.findByUsername(params.get("username"));
            if (existingUser != null && !existingUser.getId().equals(userId)) {
                throw new RuntimeException("用户名已存在");
            }
            user.setUsername(params.get("username"));
        }
        
        if (params.containsKey("password")) {
            user.setPassword(params.get("password"));
        }
        
        user = userRepository.save(user);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "更新成功");
        return result;
    }
    
    @Transactional
    public Map<String, Object> deleteUser(Long userId) {
        userRepository.deleteById(userId);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "删除成功");
        return result;
    }
    
    // 家庭组管理方法
    public Map<String, Object> createFamily(Map<String, Object> params) {
        User creator = userRepository.findById(Long.parseLong(params.get("creatorId").toString()))
                .orElseThrow(() -> new RuntimeException("创建者不存在"));
        
        Family family = new Family();
        family.setName((String) params.get("name"));
        family.setDescription((String) params.get("description"));
        family.setCreator(creator);
        family = familyRepository.save(family);
        
        // 创建者自动成为家庭组的管理员
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
    
    public Map<String, Object> listFamilies(int page, int size) {
        Page<Family> families = familyRepository.findAll(PageRequest.of(page, size));
        
        Map<String, Object> result = new HashMap<>();
        result.put("families", families.getContent());
        result.put("total", families.getTotalElements());
        result.put("totalPages", families.getTotalPages());
        return result;
    }
    
    public Map<String, Object> listFamilyMembers(Long familyId) {
        List<FamilyMember> members = familyMemberRepository.findByFamilyId(familyId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("members", members);
        return result;
    }
    
    @Transactional
    public Map<String, Object> addMember(Long familyId, Long userId, String roleStr) {
        // 验证家庭组是否存在
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new RuntimeException("家庭组不存在"));
        
        // 验证用户是否存在
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        // 检查是否已经是成员
        if (familyMemberRepository.findByFamilyIdAndUserId(familyId, userId).isPresent()) {
            throw new RuntimeException("用户已经是家庭组成员");
        }
        
        // 转换角色
        FamilyMemberRole role;
        try {
            role = FamilyMemberRole.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("无效的角色");
        }
        
        // 不能添加为ADMIN角色（管理员只能通过邀请或其他方式产生）
        if (role == FamilyMemberRole.ADMIN) {
            throw new RuntimeException("不能直接添加管理员角色");
        }
        
        // 创建成员关系
        FamilyMember member = new FamilyMember();
        member.setFamily(family);
        member.setUser(user);
        member.setRole(role);
        familyMemberRepository.save(member);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "添加成员成功");
        return result;
    }
    
    @Transactional
    public Map<String, Object> updateFamilyMemberRole(Long adminId, Long familyId, Long memberId, String role) {
        // 验证管理员身份
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("管理员不存在"));
                
        // 验证家庭组是否存在
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new RuntimeException("家庭组不存在"));
                
        // 验证管理员是否是该家庭组的管理员
        FamilyMember adminMember = familyMemberRepository
                .findByFamilyIdAndUserId(familyId, adminId)
                .orElseThrow(() -> new RuntimeException("不是该家庭组的成员"));
                
        if (adminMember.getRole() != FamilyMemberRole.ADMIN) {
            throw new RuntimeException("没有管理员权限");
        }
        
        // 验证要修改的成员是否存在
        FamilyMember member = familyMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("成员不存在"));
                
        // 更新角色
        try {
            FamilyMemberRole newRole = FamilyMemberRole.valueOf(role.toUpperCase());
            member.setRole(newRole);
            familyMemberRepository.save(member);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "角色更新成功");
            return result;
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("无效的角色值");
        }
    }
    
    @Transactional
    public Map<String, Object> removeMember(Long familyId, Long userId) {
        FamilyMember member = familyMemberRepository.findByFamilyIdAndUserId(familyId, userId)
                .orElseThrow(() -> new RuntimeException("成员不存在"));
        
        // 不能移除管理员
        if (member.getRole() == FamilyMemberRole.ADMIN) {
            throw new RuntimeException("不能移除管理员");
        }
        
        familyMemberRepository.delete(member);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "成员移除成功");
        return result;
    }
    
    @Transactional
    public Map<String, Object> deleteFamily(Long familyId, Long userId) {
        // 验证家庭组是否存在
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new RuntimeException("家庭组不存在"));
        
        // 验证是否是管理员
        FamilyMember member = familyMemberRepository.findByFamilyIdAndUserId(familyId, userId)
                .orElseThrow(() -> new RuntimeException("用户不是家庭组成员"));
                
        if (member.getRole() != FamilyMemberRole.ADMIN) {
            throw new RuntimeException("只有管理员才能删除家庭组");
        }
        
        // 删除所有成员关系
        familyMemberRepository.deleteByFamilyId(familyId);
        
        // 删除家庭组
        familyRepository.delete(family);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "家庭组删除成功");
        return result;
    }
} 