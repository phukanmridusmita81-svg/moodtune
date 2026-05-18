package com.moodtune.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "songs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Song {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String artist;

    private String album;

    // YouTube video ID for playback (e.g., "dQw4w9WgXcQ")
    @Column(name = "youtube_id")
    private String youtubeId;

    // Thumbnail URL (YouTube thumbnail)
    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    // Mood tags: HAPPY, SAD, ENERGETIC, CALM, ROMANTIC, ANGRY, FOCUS
    @Column(nullable = false)
    private String mood;

    // Genre: pop, hiphop, rock, jazz, lofi, rnb, edm, classical
    private String genre;

    // Duration in seconds
    private Integer duration;

    // Play count
    @Column(name = "play_count")
    private Long playCount = 0L;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}