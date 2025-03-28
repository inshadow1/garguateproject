package org.example.stuff.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "family_members")
public class FamilyMember {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "family_id", nullable = false)
    private Family family;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private FamilyMemberRole role = FamilyMemberRole.MEMBER;
    
    @Column(nullable = false)
    private LocalDateTime joinTime;
    
    @PrePersist
    protected void onCreate() {
        joinTime = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Family getFamily() {
        return family;
    }

    public void setFamily(Family family) {
        this.family = family;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public FamilyMemberRole getRole() {
        return role;
    }

    public void setRole(FamilyMemberRole role) {
        this.role = role;
    }

    public LocalDateTime getJoinTime() {
        return joinTime;
    }
} 