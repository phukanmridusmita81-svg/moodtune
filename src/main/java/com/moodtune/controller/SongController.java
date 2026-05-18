package com.moodtune.controller;

import com.moodtune.dto.SongDTO;
import com.moodtune.service.SongService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/songs")
@RequiredArgsConstructor
public class SongController {

    private final SongService songService;

    // GET /api/songs/mood/HAPPY
    @GetMapping("/mood/{mood}")
    public ResponseEntity<List<SongDTO>> getSongsByMood(@PathVariable String mood) {
        return ResponseEntity.ok(songService.getSongsByMood(mood));
    }

    // GET /api/songs/mood/HAPPY?genre=pop
    @GetMapping("/mood/{mood}/genre")
    public ResponseEntity<List<SongDTO>> getSongsByMoodAndGenre(
            @PathVariable String mood,
            @RequestParam String genre) {
        return ResponseEntity.ok(songService.getSongsByMoodAndGenre(mood, genre));
    }

    // GET /api/songs/search?q=arijit
    @GetMapping("/search")
    public ResponseEntity<List<SongDTO>> search(@RequestParam String q) {
        return ResponseEntity.ok(songService.searchSongs(q));
    }

    // GET /api/songs/trending
    @GetMapping("/trending")
    public ResponseEntity<List<SongDTO>> trending() {
        return ResponseEntity.ok(songService.getTrendingSongs());
    }

    // POST /api/songs/{id}/play
    @PostMapping("/{id}/play")
    public ResponseEntity<SongDTO> incrementPlay(@PathVariable Long id) {
        return ResponseEntity.ok(songService.incrementPlayCount(id));
    }

    // POST /api/songs (Add new song)
    @PostMapping
    public ResponseEntity<SongDTO> addSong(@RequestBody SongDTO dto) {
        return ResponseEntity.ok(songService.addSong(dto));
    }
}