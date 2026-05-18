package com.moodtune.repository;

import com.moodtune.model.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    List<Playlist> findByUserId(String userId);
    List<Playlist> findByMoodIgnoreCase(String mood);
}