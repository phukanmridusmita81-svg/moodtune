package com.moodtune.controller;

import com.moodtune.model.Playlist;
import com.moodtune.service.PlaylistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/playlists")
@RequiredArgsConstructor
public class PlaylistController {

    private final PlaylistService playlistService;

    // POST /api/playlists
    @PostMapping
    public ResponseEntity<Playlist> create(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(playlistService.createPlaylist(
                body.get("name"),
                body.get("mood"),
                body.get("userId")
        ));
    }

    // GET /api/playlists/user/user123
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Playlist>> getUserPlaylists(@PathVariable String userId) {
        return ResponseEntity.ok(playlistService.getUserPlaylists(userId));
    }

    // GET /api/playlists/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Playlist> getPlaylist(@PathVariable Long id) {
        return playlistService.getPlaylist(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/playlists/{id}/songs/{songId}
    @PostMapping("/{id}/songs/{songId}")
    public ResponseEntity<Playlist> addSong(@PathVariable Long id, @PathVariable Long songId) {
        return ResponseEntity.ok(playlistService.addSongToPlaylist(id, songId));
    }

    // DELETE /api/playlists/{id}/songs/{songId}
    @DeleteMapping("/{id}/songs/{songId}")
    public ResponseEntity<Playlist> removeSong(@PathVariable Long id, @PathVariable Long songId) {
        return ResponseEntity.ok(playlistService.removeSongFromPlaylist(id, songId));
    }

    // DELETE /api/playlists/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        playlistService.deletePlaylist(id);
        return ResponseEntity.noContent().build();
    }
}