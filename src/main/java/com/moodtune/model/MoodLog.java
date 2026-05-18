package com.moodtune.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mood_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoodLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Raw user input text
    @Column(name = "user_input", columnDefinition = "TEXT")
    private String userInput;

    // Detected mood
    @Column(name = "detected_mood")
    private String detectedMood;

    // Confidence score (0.0 - 1.0)
    private Double confidence;

    // User session ID
    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}