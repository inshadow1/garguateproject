package org.example.stuff.service;

import org.example.stuff.entity.Category;
import org.example.stuff.entity.Item;
import org.example.stuff.entity.User;
import org.example.stuff.entity.Reminder;
import org.example.stuff.entity.Favorite;
import org.example.stuff.entity.UserRole;
import org.example.stuff.repository.CategoryRepository;
import org.example.stuff.repository.ItemRepository;
import org.example.stuff.repository.UserRepository;
import org.example.stuff.repository.ReminderRepository;
import org.example.stuff.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class ItemService {
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private ReminderRepository reminderRepository;
    
    @Autowired
    private FavoriteRepository favoriteRepository;
    
    @Transactional
    public Item createItem(String name, Long categoryId, Integer quantity, 
                         String location, String description, String imageUrl, 
                         Long userId, Integer stockThreshold, Integer usageInterval) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
                
        // 检查权限
        if (user.getRole() == UserRole.GUEST) {
            throw new RuntimeException("访客无权添加物品");
        }
        
        // 如果是普通成员，只能添加自己的物品
        if (user.getRole() == UserRole.MEMBER && !user.getId().equals(userId)) {
            throw new RuntimeException("只能添加自己的物品");
        }
                
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("分类不存在"));
                
        // 验证分类是否属于该用户
        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权限使用此分类");
        }
        
        // 创建物品
        Item item = new Item();
        item.setName(name);
        item.setCategory(category);
        item.setUser(user);
        item.setQuantity(quantity);
        item.setLocation(location);
        item.setDescription(description);
        item.setImageUrl(imageUrl);
        
        item = itemRepository.save(item);
        
        // 如果设置了库存提醒阈值，创建库存提醒
        if (stockThreshold != null) {
            Reminder stockReminder = new Reminder();
            stockReminder.setItem(item);
            stockReminder.setUser(user);
            stockReminder.setType(Reminder.ReminderType.STOCK);
            stockReminder.setStockThreshold(stockThreshold);
            stockReminder.setEnabled(true);
            reminderRepository.save(stockReminder);
        }
        
        // 如果设置了使用提醒间隔，创建使用提醒
        if (usageInterval != null) {
            Reminder usageReminder = new Reminder();
            usageReminder.setItem(item);
            usageReminder.setUser(user);
            usageReminder.setType(Reminder.ReminderType.USAGE);
            usageReminder.setUsageInterval(usageInterval);
            usageReminder.setLastUsageTime(LocalDateTime.now());
            usageReminder.setEnabled(true);
            reminderRepository.save(usageReminder);
        }
        
        return item;
    }
    
    public Page<Item> getUserItems(Long userId, Long categoryId, Pageable pageable) {
        if (categoryId != null) {
            return itemRepository.findByUserIdAndCategoryId(userId, categoryId, pageable);
        }
        return itemRepository.findByUserId(userId, pageable);
    }
    
    public Item updateItem(Long itemId, String name, Long categoryId, Integer quantity,
                         String location, String description, String imageUrl, Long userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("物品不存在"));
                
        // 验证是否是该用户的物品
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权限修改此物品");
        }
        
        // 只有当传入新的分类ID，且与原分类不同时才更新分类
        if (categoryId != null && !categoryId.equals(item.getCategory().getId())) {
            Category newCategory = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("分类不存在"));
            // 验证新分类是否属于该用户
            if (!newCategory.getUser().getId().equals(userId)) {
                throw new RuntimeException("无权限使用此分类");
            }
            item.setCategory(newCategory);
        }
        
        // 只更新传入的非空字段
        if (name != null) {
            item.setName(name);
        }
        if (quantity != null) {
            item.setQuantity(quantity);
        }
        if (location != null) {
            item.setLocation(location);
        }
        if (description != null) {
            item.setDescription(description);
        }
        if (imageUrl != null) {
            item.setImageUrl(imageUrl);
        }
        
        return itemRepository.save(item);
    }
    
    @Transactional
    public void deleteItem(Long itemId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
                
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("物品不存在"));
                
        // 检查权限
        if (user.getRole() != UserRole.ADMIN && !item.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权删除此物品");
        }
        
        // 先删除与该物品相关的所有提醒
        reminderRepository.deleteByItemId(itemId);
        
        // 删除与该物品相关的所有收藏
        favoriteRepository.deleteByItemId(itemId);
        
        // 最后删除物品
        itemRepository.delete(item);
    }
    
    public Map<String, Object> getItemDetail(Long itemId, Long userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("物品不存在"));
                
        // 验证是否是该用户的物品
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权限查看此物品");
        }
        
        // 获取提醒设置
        Reminder stockReminder = reminderRepository
                .findByItemIdAndType(itemId, Reminder.ReminderType.STOCK)
                .orElse(null);
                
        Reminder usageReminder = reminderRepository
                .findByItemIdAndType(itemId, Reminder.ReminderType.USAGE)
                .orElse(null);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("item", item);
        
        // 添加提醒设置信息
        if (stockReminder != null) {
            result.put("stockThreshold", stockReminder.getStockThreshold());
            result.put("stockReminderEnabled", stockReminder.getEnabled());
        }
        
        if (usageReminder != null) {
            result.put("usageInterval", usageReminder.getUsageInterval());
            result.put("usageReminderEnabled", usageReminder.getEnabled());
            result.put("lastUsageTime", usageReminder.getLastUsageTime());
        }
        
        return result;
    }

    public Page<Item> searchFamilyItems(Long familyId, String keyword, Long categoryId, 
                                String location, LocalDateTime startTime, 
                                LocalDateTime endTime, Pageable pageable) {
        // 如果关键字是空字符串，设置为null
        if (keyword != null && keyword.trim().isEmpty()) {
            keyword = null;
        }
        // 如果位置是空字符串，设置为null
        if (location != null && location.trim().isEmpty()) {
            location = null;
        }
        
        return itemRepository.searchFamilyItems(
            familyId,
            keyword,
            categoryId,
            location,
            startTime,
            endTime,
            pageable
        );
    }
    public Page<Item> searchItems(Long userId, String keyword, Long categoryId, 
                                String location, LocalDateTime startTime, 
                                LocalDateTime endTime, Pageable pageable) {
        // 如果关键字是空字符串，设置为null
        if (keyword != null && keyword.trim().isEmpty()) {
            keyword = null;
        }
        // 如果位置是空字符串，设置为null
        if (location != null && location.trim().isEmpty()) {
            location = null;
        }
        
        return itemRepository.searchItems(
            userId,
            keyword,
            categoryId,
            location,
            startTime,
            endTime,
            pageable
        );
    }

    @Transactional
    public Map<String, Object> updateQuantity(Long itemId, Integer amount, Long userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("物品不存在"));
                
        // 验证是否是该用户的物品
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权限操作此物品");
        }
        
        // 计算新的数量
        int newQuantity = item.getQuantity() + amount;
        
        // 检查数量是否合法
        if (newQuantity < 0) {
            throw new RuntimeException("库存不足，当前库存: " + item.getQuantity());
        }
        
        // 更新数量
        item.setQuantity(newQuantity);
        item = itemRepository.save(item);
        
        String message = amount > 0 ? "数量已增加" : "数量已减少";
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", message);
        result.put("item", item);
        
        return result;
    }
}