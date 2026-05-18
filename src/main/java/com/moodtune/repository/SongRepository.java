// SongRepository.java
package com.moodtune.repository;

import com.moodtune.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SongRepository extends JpaRepository<Song, Long> {
    List<Song> findByMoodIgnoreCase(String mood);
    List<Song> findByMoodAndGenreIgnoreCase(String mood, String genre);
    List<Song> findByTitleContainingIgnoreCaseOrArtistContainingIgnoreCase(String title, String artist);
    List<Song> findTop20ByOrderByPlayCountDesc();
}