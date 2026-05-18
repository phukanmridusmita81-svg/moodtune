package com.moodtune.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MoodRequest {

    @NotBlank(message = "Input text cannot be empty")
    private String text;    // User's mood text / emoji input

    private String sessionId; // Optional session tracking
}