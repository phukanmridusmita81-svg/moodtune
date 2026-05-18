package com.moodtune.repository;

import com.moodtune.model.MoodLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MoodLogRepository extends JpaRepository<MoodLog, Long> {
    List<MoodLog> findBySessionId(String sessionId);
    List<MoodLog> findByDetectedMood(String mood);
}