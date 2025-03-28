package org.example.stuff.repository;

import org.example.stuff.entity.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {
    Page<Item> findByUserId(Long userId, Pageable pageable);
    Page<Item> findByUserIdAndCategoryId(Long userId, Long categoryId, Pageable pageable);

    @Query("SELECT i FROM Item i WHERE i.user.id IN " +
           "(SELECT fm.user.id FROM FamilyMember fm WHERE fm.family.id = :familyId) " +
           "AND (:keyword IS NULL OR (i.name LIKE %:keyword% OR i.description LIKE %:keyword%)) " +
           "AND (:categoryId IS NULL OR i.category.id = :categoryId) " +
           "AND (:location IS NULL OR i.location LIKE %:location%) " +
           "AND (:startTime IS NULL OR i.createTime >= :startTime) " +
           "AND (:endTime IS NULL OR i.createTime <= :endTime)")
    Page<Item> searchFamilyItems(
            @Param("familyId") Long familyId,
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            @Param("location") String location,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable
    );

    @Query("SELECT i FROM Item i WHERE i.user.id = :userId " +
           "AND (:keyword IS NULL OR (i.name LIKE %:keyword% OR i.description LIKE %:keyword%)) " +
           "AND (:categoryId IS NULL OR i.category.id = :categoryId) " +
           "AND (:location IS NULL OR i.location LIKE %:location%) " +
           "AND (:startTime IS NULL OR i.createTime >= :startTime) " +
           "AND (:endTime IS NULL OR i.createTime <= :endTime)")
    Page<Item> searchItems(
            @Param("userId") Long userId,
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            @Param("location") String location,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable
    );

    long countByCreateTimeAfter(LocalDateTime time);
}