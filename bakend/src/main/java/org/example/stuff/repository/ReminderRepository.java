package org.example.stuff.repository;

import org.example.stuff.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    Optional<Reminder> findByItemIdAndType(Long itemId, Reminder.ReminderType type);
    List<Reminder> findByUserId(Long userId);
    
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId " +
           "AND r.enabled = true " +
           "AND r.type = 'STOCK' " +
           "AND r.item.quantity <= r.stockThreshold")
    List<Reminder> findLowStockRemindersByUserId(@Param("userId") Long userId);
    
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId " +
           "AND r.enabled = true " +
           "AND r.type = 'USAGE' " +
           "AND DATEDIFF(CURRENT_TIMESTAMP, r.lastUsageTime) >= r.usageInterval")
    List<Reminder> findDueUsageRemindersByUserId(@Param("userId") Long userId);
    
    void deleteByItemId(Long itemId);
} 