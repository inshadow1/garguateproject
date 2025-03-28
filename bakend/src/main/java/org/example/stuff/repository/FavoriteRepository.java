package org.example.stuff.repository;

import org.example.stuff.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    boolean existsByUserIdAndItemId(Long userId, Long itemId);
    Page<Favorite> findByUserId(Long userId, Pageable pageable);
    void deleteByUserIdAndItemId(Long userId, Long itemId);
    void deleteByItemId(Long itemId);
} 