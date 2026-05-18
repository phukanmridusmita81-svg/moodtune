package com.moodtune.controller;

import com.moodtune.service.LyricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/lyrics")
@RequiredArgsConstructor
public class LyricsController {

    private final LyricsService lyricsService;

    // GET /api/lyrics?artist=Arijit+Singh&title=Tum+Hi+Ho
    @GetMapping
    public ResponseEntity<Map<String, String>> getLyrics(
            @RequestParam String artist,
            @RequestParam String title) {
        String lyrics = lyricsService.getLyrics(artist, title);
        return ResponseEntity.ok(Map.of(
                "artist", artist,
                "title", title,
                "lyrics", lyrics
        ));
    }
}