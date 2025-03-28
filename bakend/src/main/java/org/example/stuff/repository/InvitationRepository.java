package org.example.stuff.repository;

import org.example.stuff.entity.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {
    Optional<Invitation> findByCodeAndUsedFalse(String code);
    
    List<Invitation> findByInviteeIdAndUsedFalseAndExpireTimeAfter(
        Long inviteeId, LocalDateTime now);

    long countByUsedFalseAndExpireTimeAfter(LocalDateTime time);
} 