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
import java.util.Random;

import javax.persistence.EntityManager;
import javax.persistence.Column;

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
        invitation.setInviteeEmail(invitee.getEmail());
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

    // 生成邀请码方法
    @Transactional
    public Map<String, Object> generateInviteCode(Long familyId, Long adminId) {
        // 验证家庭组是否存在
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new RuntimeException("家庭组不存在"));

        // 验证用户是否是家庭组管理员
        FamilyMember admin = familyMemberRepository.findByFamilyIdAndUserId(familyId, adminId)
                .orElseThrow(() -> new RuntimeException("您不是该家庭组成员"));

        if (admin.getRole() != FamilyMemberRole.ADMIN) {
            throw new RuntimeException("只有管理员可以生成邀请码");
        }

        // 生成6位随机邀请码
        String inviteCode = generateRandomCode(6);

        // 创建通用邀请（没有特定的invitee）
        Invitation invitation = new Invitation();
        invitation.setFamily(family);
        invitation.setInviter(admin.getUser());
        invitation.setInvitee(null); // 通用邀请码，没有具体的受邀人
        invitation.setInviteeEmail(null); // 设置邮箱为空
        invitation.setCode(inviteCode);
        invitation.setExpireTime(LocalDateTime.now().plusDays(7)); // 7天有效期
        invitation = invitationRepository.save(invitation);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "邀请码生成成功");
        result.put("inviteCode", inviteCode);
        result.put("expireTime", invitation.getExpireTime());
        return result;
    }

    // 通过邀请码加入家庭组
    @Transactional
    public Map<String, Object> joinByInviteCode(String inviteCode, Long userId) {
        // 查找邀请码
        Invitation invitation = invitationRepository.findByCodeAndUsedFalse(inviteCode)
                .orElseThrow(() -> new RuntimeException("邀请码无效或已被使用"));

        // 检查邀请码是否过期
        if (invitation.getExpireTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("邀请码已过期");
        }

        // 获取用户
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 获取家庭组
        Family family = invitation.getFamily();

        // 检查用户是否已经是家庭成员
        if (familyMemberRepository.findByFamilyIdAndUserId(family.getId(), userId).isPresent()) {
            throw new RuntimeException("您已经是该家庭组成员");
        }

        // 创建家庭成员关系
        FamilyMember member = new FamilyMember();
        member.setFamily(family);
        member.setUser(user);
        member.setRole(FamilyMemberRole.MEMBER); // 默认角色为普通成员
        familyMemberRepository.save(member);

        // 将邀请标记为已使用
        invitation.setUsed(true);
        invitation.setInvitee(user); // 更新实际接受邀请的用户
        invitation.setInviteeEmail(user.getEmail()); // 更新受邀人邮箱
        invitationRepository.save(invitation);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "成功加入家庭组");
        result.put("familyId", family.getId());
        result.put("familyName", family.getName());
        return result;
    }

    // 生成随机邀请码
    private String generateRandomCode(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(chars.length());
            sb.append(chars.charAt(index));
        }

        return sb.toString();
    }

    // ... 其他方法 ...
}