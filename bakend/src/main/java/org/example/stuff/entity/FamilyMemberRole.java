package org.example.stuff.entity;

public enum FamilyMemberRole {
    ADMIN("管理员"),      // 家庭管理员
    MEMBER("普通成员"),   // 普通家庭成员
    GUEST("访客");       // 家庭访客
    
    private final String description;
    
    FamilyMemberRole(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
} 