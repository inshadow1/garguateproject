package org.example.stuff.service;

import org.example.stuff.entity.Item;
import org.example.stuff.entity.Reminder;
import org.example.stuff.entity.User;
import org.example.stuff.repository.ItemRepository;
import org.example.stuff.repository.ReminderRepository;
import org.example.stuff.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class ReminderService {
    
    @Autowired
    private ReminderRepository reminderRepository;
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Reminder createStockReminder(Long itemId, Integer threshold, Long userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("物品不存在"));
                
        // 验证是否是该用户的物品
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权限设置此物品的提醒");
        }
        
        // 检查是否已存在同类型的提醒
        Reminder reminder = reminderRepository.findByItemIdAndType(itemId, Reminder.ReminderType.STOCK)
                .orElse(new Reminder());  // 如果不存在就创建新的
        
        // 设置或更新提醒信息
        reminder.setItem(item);
        reminder.setUser(item.getUser());
        reminder.setType(Reminder.ReminderType.STOCK);
        reminder.setStockThreshold(threshold);
        reminder.setEnabled(true);
        
        return reminderRepository.save(reminder);
    }
    
    public Reminder createUsageReminder(Long itemId, Integer interval, Long userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("物品不存在"));
                
        // 验证是否是该用户的物品
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权限设置此物品的提醒");
        }
        
        // 检查是否已存在同类型的提醒
        Reminder reminder = reminderRepository.findByItemIdAndType(itemId, Reminder.ReminderType.USAGE)
                .orElse(new Reminder());  // 如果不存在就创建新的
        
        // 设置或更新提醒信息
        reminder.setItem(item);
        reminder.setUser(item.getUser());
        reminder.setType(Reminder.ReminderType.USAGE);
        reminder.setUsageInterval(interval);
        reminder.setLastUsageTime(LocalDateTime.now());
        reminder.setEnabled(true);
        
        return reminderRepository.save(reminder);
    }
    
    public void updateLastUsageTime(Long itemId, Long userId) {
        reminderRepository.findByItemIdAndType(itemId, Reminder.ReminderType.USAGE)
                .ifPresent(reminder -> {
                    if (!reminder.getUser().getId().equals(userId)) {
                        throw new RuntimeException("无权限更新此提醒");
                    }
                    reminder.setLastUsageTime(LocalDateTime.now());
                    reminderRepository.save(reminder);
                });
    }
    
    public void toggleReminder(Long reminderId, Boolean enabled, Long userId) {
        Reminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new RuntimeException("提醒不存在"));
                
        if (!reminder.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权限修改此提醒");
        }
        
        reminder.setEnabled(enabled);
        reminderRepository.save(reminder);
    }
    
    public void deleteReminder(Long reminderId, Long userId) {
        Reminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new RuntimeException("提醒不存在"));
                
        if (!reminder.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权限删除此提醒");
        }
        
        reminderRepository.delete(reminder);
    }
    
    public List<Reminder> getUserReminders(Long userId) {
        return reminderRepository.findByUserId(userId);
    }
    
    public Map<String, Object> getRemindersToAlert(Long userId) {
        // 获取需要低库存提醒的物品
        List<Reminder> lowStockReminders = reminderRepository.findLowStockRemindersByUserId(userId);
        
        // 获取需要使用提醒的物品
        List<Reminder> dueUsageReminders = reminderRepository.findDueUsageRemindersByUserId(userId);
        
        // 转换为前端需要的格式
        List<Map<String, Object>> lowStockAlerts = lowStockReminders.stream()
                .map(r -> {
                    Map<String, Object> alert = new HashMap<>();
                    alert.put("reminderId", r.getId());
                    alert.put("itemId", r.getItem().getId());
                    alert.put("itemName", r.getItem().getName());
                    alert.put("currentQuantity", r.getItem().getQuantity());
                    alert.put("threshold", r.getStockThreshold());
                    alert.put("location", r.getItem().getLocation());
                    return alert;
                })
                .collect(Collectors.toList());
                
        List<Map<String, Object>> usageAlerts = dueUsageReminders.stream()
                .map(r -> {
                    Map<String, Object> alert = new HashMap<>();
                    alert.put("reminderId", r.getId());
                    alert.put("itemId", r.getItem().getId());
                    alert.put("itemName", r.getItem().getName());
                    alert.put("interval", r.getUsageInterval());
                    alert.put("lastUsageTime", r.getLastUsageTime());
                    alert.put("location", r.getItem().getLocation());
                    return alert;
                })
                .collect(Collectors.toList());
                
        Map<String, Object> result = new HashMap<>();
        result.put("lowStockAlerts", lowStockAlerts);
        result.put("usageAlerts", usageAlerts);
        return result;
    }
} 