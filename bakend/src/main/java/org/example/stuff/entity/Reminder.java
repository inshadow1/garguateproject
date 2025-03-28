package org.example.stuff.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reminders")
public class Reminder {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ReminderType type;
    
    // 低库存提醒阈值
    private Integer stockThreshold;
    
    // 定期使用提醒间隔（天数）
    private Integer usageInterval;
    
    // 上次使用时间
    private LocalDateTime lastUsageTime;
    
    // 是否启用
    @Column(nullable = false)
    private Boolean enabled = true;
    
    @Column(nullable = false)
    private LocalDateTime createTime;
    
    @Column(nullable = false)
    private LocalDateTime updateTime;
    
    public enum ReminderType {
        STOCK,      // 低库存提醒
        USAGE       // 定期使用提醒
    }
    
    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Item getItem() {
        return item;
    }

    public void setItem(Item item) {
        this.item = item;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public ReminderType getType() {
        return type;
    }

    public void setType(ReminderType type) {
        this.type = type;
    }

    public Integer getStockThreshold() {
        return stockThreshold;
    }

    public void setStockThreshold(Integer stockThreshold) {
        this.stockThreshold = stockThreshold;
    }

    public Integer getUsageInterval() {
        return usageInterval;
    }

    public void setUsageInterval(Integer usageInterval) {
        this.usageInterval = usageInterval;
    }

    public LocalDateTime getLastUsageTime() {
        return lastUsageTime;
    }

    public void setLastUsageTime(LocalDateTime lastUsageTime) {
        this.lastUsageTime = lastUsageTime;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }
} 