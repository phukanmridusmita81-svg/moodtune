package com.moodtune.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoodResponse {
    private String mood;           // e.g., "HAPPY"
    private String moodEmoji;      // e.g., "😊"
    private String moodColor;      // e.g., "#FFD700"
    private double confidence;     // 0.0 - 1.0
    private String description;    // Human-readable description
    private List<String> genres;   // Suggested genres for this mood
    private List<String> keywords; // Detected keywords
}