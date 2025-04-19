package org.example.stuff.service;

import org.example.stuff.entity.User;
import org.example.stuff.entity.UserRole;
import org.example.stuff.entity.FamilyMember;
import org.example.stuff.repository.UserRepository;
import org.example.stuff.repository.FamilyMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Value("${app.base-url}")
    private String baseUrl;

    public User register(String username, String password) {
        // 检查用户名是否已存在
        if (userRepository.findByUsername(username) != null) {
            throw new RuntimeException("用户名已存在");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        user.setRole(UserRole.MEMBER); // 设置默认角色为普通成员
        return userRepository.save(user);
    }

    public User login(String username, String password) {
        User user = userRepository.findByUsername(username);
        if (user == null || !user.getPassword().equals(password)) {
            throw new RuntimeException("用户名或密码错误");
        }
        return user;
    }

    public Map<String, Object> getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 获取用户的所有家庭成员身份
        List<FamilyMember> memberships = familyMemberRepository.findByUserId(userId);

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("nickname", user.getNickname());
        profile.put("role", user.getRole().name());
        profile.put("roleDesc", user.getRole().getDescription());

        // 添加家庭成员信息
        List<Map<String, Object>> familyRoles = memberships.stream()
                .map(member -> {
                    Map<String, Object> familyRole = new HashMap<>();
                    familyRole.put("familyId", member.getFamily().getId());
                    familyRole.put("familyName", member.getFamily().getName());
                    familyRole.put("role", member.getRole().name());
                    familyRole.put("roleDesc", member.getRole().getDescription());
                    return familyRole;
                })
                .collect(Collectors.toList());
        profile.put("familyRoles", familyRoles);

        // 处理头像URL
        String avatar = user.getAvatar();
        if (avatar != null) {
            if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
                profile.put("avatar", avatar);
            } else {
                profile.put("avatar", baseUrl + avatar);
            }
        } else {
            profile.put("avatar", null);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("profile", profile);
        return result;
    }

    @Transactional
    public Map<String, Object> updateUserProfile(Long userId, Map<String, Object> params) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 更新用户名（需要检查唯一性）
        if (params.containsKey("username")) {
            String newUsername = (String) params.get("username");
            User existingUser = userRepository.findByUsername(newUsername);
            if (existingUser != null && !existingUser.getId().equals(userId)) {
                throw new RuntimeException("用户名已存在");
            }
            user.setUsername(newUsername);
        }

        // 更新其他信息
        if (params.containsKey("email")) {
            user.setEmail((String) params.get("email"));
        }
        if (params.containsKey("nickname")) {
            user.setNickname((String) params.get("nickname"));
        }
        if (params.containsKey("avatar")) {
            user.setAvatar((String) params.get("avatar"));
        }

        userRepository.save(user);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "个人信息更新成功");
        return result;
    }

    @Transactional
    public Map<String, Object> updatePassword(Long userId, Map<String, String> params) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        String oldPassword = params.get("oldPassword");
        String newPassword = params.get("newPassword");

        // 验证旧密码
        if (!user.getPassword().equals(oldPassword)) {
            throw new RuntimeException("旧密码错误");
        }

        // 更新密码
        user.setPassword(newPassword);
        userRepository.save(user);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "密码修改成功");
        return result;
    }

    @Transactional
    public Map<String, Object> updateAvatar(Long userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        user.setAvatar(avatarUrl);
        user = userRepository.save(user);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "头像更新成功");
        result.put("avatar", user.getAvatar());

        return result;
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    @Transactional
    public Map<String, Object> updateUserRole(Long adminId, Long userId, UserRole newRole) {
        // 验证操作者是否是管理员
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("管理员不存在"));

        if (admin.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("只有管理员可以修改用户角色");
        }

        // 更新用户角色
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        user.setRole(newRole);
        userRepository.save(user);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "用户角色已更新");
        return result;
    }
}