package org.example.stuff.controller;

import org.example.stuff.entity.Reminder;
import org.example.stuff.service.ReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reminder")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class ReminderController {
    
    @Autowired
    private ReminderService reminderService;
    
    @PostMapping("/stock")
    public Map<String, Object> createStockReminder(@RequestBody Map<String, Object> params) {
        Reminder reminder = reminderService.createStockReminder(
            Long.parseLong(params.get("itemId").toString()),
            Integer.parseInt(params.get("threshold").toString()),
            Long.parseLong(params.get("userId").toString())
        );
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "创建成功");
        result.put("reminder", reminder);
        return result;
    }
    
    @PostMapping("/usage")
    public Map<String, Object> createUsageReminder(@RequestBody Map<String, Object> params) {
        Reminder reminder = reminderService.createUsageReminder(
            Long.parseLong(params.get("itemId").toString()),
            Integer.parseInt(params.get("interval").toString()),
            Long.parseLong(params.get("userId").toString())
        );
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "创建成功");
        result.put("reminder", reminder);
        return result;
    }
    
    @PostMapping("/usage/{itemId}")
    public Map<String, Object> updateLastUsageTime(
            @PathVariable Long itemId,
            @RequestParam Long userId) {
        reminderService.updateLastUsageTime(itemId, userId);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "更新成功");
        return result;
    }
    
    @PutMapping("/toggle/{reminderId}")
    public Map<String, Object> toggleReminder(
            @PathVariable Long reminderId,
            @RequestBody Map<String, Object> params) {
        reminderService.toggleReminder(
            reminderId,
            (Boolean) params.get("enabled"),
            Long.parseLong(params.get("userId").toString())
        );
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "更新成功");
        return result;
    }
    
    @DeleteMapping("/{reminderId}")
    public Map<String, Object> deleteReminder(
            @PathVariable Long reminderId,
            @RequestParam Long userId) {
        reminderService.deleteReminder(reminderId, userId);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "删除成功");
        return result;
    }
    
    @GetMapping("/list/{userId}")
    public Map<String, Object> getUserReminders(@PathVariable Long userId) {
        List<Reminder> reminders = reminderService.getUserReminders(userId);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("reminders", reminders);
        return result;
    }
    
    @GetMapping("/alerts/{userId}")
    public Map<String, Object> getRemindersToAlert(@PathVariable Long userId) {
        Map<String, Object> alerts = reminderService.getRemindersToAlert(userId);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", alerts);
        return result;
    }
} 