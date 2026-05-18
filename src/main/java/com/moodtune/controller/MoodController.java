package com.moodtune.controller;

import com.moodtune.dto.MoodRequest;
import com.moodtune.dto.MoodResponse;
import com.moodtune.service.MoodDetectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mood")
@RequiredArgsConstructor
public class MoodController {

    private final MoodDetectionService moodDetectionService;

    // POST /api/mood/detect
    // Body: { "text": "I'm feeling so happy today! 😊", "sessionId": "user123" }
    @PostMapping("/detect")
    public ResponseEntity<MoodResponse> detectMood(@Valid @RequestBody MoodRequest request) {
        MoodResponse response = moodDetectionService.detectMood(request);
        return ResponseEntity.ok(response);
    }

    // GET /api/mood/stats
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getMoodStats() {
        return ResponseEntity.ok(moodDetectionService.getMoodStats());
    }
}