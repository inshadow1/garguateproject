package org.example.stuff.repository;

import org.example.stuff.entity.Family;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FamilyRepository extends JpaRepository<Family, Long> {
    Page<Family> findAll(Pageable pageable);
} 