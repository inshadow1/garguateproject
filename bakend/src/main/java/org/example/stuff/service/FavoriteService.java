package org.example.stuff.service;

import org.example.stuff.entity.Favorite;
import org.example.stuff.entity.Item;
import org.example.stuff.entity.User;
import org.example.stuff.repository.FavoriteRepository;
import org.example.stuff.repository.ItemRepository;
import org.example.stuff.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FavoriteService {
    
    @Autowired
    private FavoriteRepository favoriteRepository;
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Favorite addFavorite(Long itemId, Long userId) {
        // 检查是否已收藏
        if (favoriteRepository.existsByUserIdAndItemId(userId, itemId)) {
            throw new RuntimeException("已收藏此物品");
        }
        
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("物品不存在"));
                
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        Favorite favorite = new Favorite();
        favorite.setItem(item);
        favorite.setUser(user);
        
        return favoriteRepository.save(favorite);
    }
    
    public Page<Favorite> getUserFavorites(Long userId, Pageable pageable) {
        return favoriteRepository.findByUserId(userId, pageable);
    }
    
    @Transactional
    public void removeFavorite(Long itemId, Long userId) {
        favoriteRepository.deleteByUserIdAndItemId(userId, itemId);
    }
    
    public boolean isFavorite(Long itemId, Long userId) {
        return favoriteRepository.existsByUserIdAndItemId(userId, itemId);
    }
} 