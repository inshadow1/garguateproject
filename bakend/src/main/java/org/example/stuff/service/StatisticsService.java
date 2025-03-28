package org.example.stuff.service;

import org.example.stuff.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

@Service
public class StatisticsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Autowired
    private FamilyRepository familyRepository;
    
    @Autowired
    private InvitationRepository invitationRepository;
    
    public Map<String, Object> getDashboardStatistics() {
        // 获取总用户数
        long totalUsers = userRepository.count();
        
        // 获取总物品数
        long totalItems = itemRepository.count();
        
        // 获取总家庭组数
        long totalFamilies = familyRepository.count();
        
        // 获取未处理的邀请数
        LocalDateTime now = LocalDateTime.now();
        long pendingInvitations = invitationRepository.countByUsedFalseAndExpireTimeAfter(now);
        
        // 获取今日新增用户数
        LocalDateTime todayStart = now.truncatedTo(ChronoUnit.DAYS);
        long newUsersToday = userRepository.countByCreateTimeAfter(todayStart);
        
        // 获取今日新增物品数
        long newItemsToday = itemRepository.countByCreateTimeAfter(todayStart);
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalUsers", totalUsers);
        statistics.put("totalItems", totalItems);
        statistics.put("totalFamilies", totalFamilies);
        statistics.put("pendingInvitations", pendingInvitations);
        statistics.put("newUsersToday", newUsersToday);
        statistics.put("newItemsToday", newItemsToday);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("statistics", statistics);
        return result;
    }
} 