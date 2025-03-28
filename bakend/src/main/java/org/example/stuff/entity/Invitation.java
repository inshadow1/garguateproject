package org.example.stuff.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "invitations")
public class Invitation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "family_id", nullable = false)
    private Family family;
    
    @ManyToOne
    @JoinColumn(name = "inviter_id", nullable = false)
    private User inviter;
    
    @ManyToOne
    @JoinColumn(name = "invitee_id", nullable = false)
    private User invitee;
    
    @Column(nullable = false)
    private String code;
    
    @Column(nullable = false)
    private Boolean used = false;
    
    @Column(nullable = false)
    private LocalDateTime createTime;
    
    @Column(nullable = false)
    private LocalDateTime expireTime;
    
    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        // 默认24小时有效期
        expireTime = createTime.plusHours(24);
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

    public User getInviter() {
        return inviter;
    }

    public void setInviter(User inviter) {
        this.inviter = inviter;
    }

    public User getInvitee() {
        return invitee;
    }

    public void setInvitee(User invitee) {
        this.invitee = invitee;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Boolean getUsed() {
        return used;
    }

    public void setUsed(Boolean used) {
        this.used = used;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public LocalDateTime getExpireTime() {
        return expireTime;
    }

    public void setExpireTime(LocalDateTime expireTime) {
        this.expireTime = expireTime;
    }
} 