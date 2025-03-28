package org.example.stuff.repository;

import org.example.stuff.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    
    // 添加按用户名模糊搜索的方法
    Page<User> findByUsernameContaining(String keyword, Pageable pageable);
    
    // 添加按用户名精确搜索的方法，并返回分页结果
    Page<User> findByUsername(String username, Pageable pageable);

    long countByCreateTimeAfter(LocalDateTime time);
} 