package org.example.stuff.entity;

public enum UserRole {
    ADMIN("管理员"),      // 管理员
    MEMBER("普通成员"),   // 普通成员
    GUEST("访客");       // 访客
    
    private final String description;
    
    UserRole(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
} 