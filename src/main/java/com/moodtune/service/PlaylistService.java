package com.moodtune.service;

import com.moodtune.model.Playlist;
import com.moodtune.model.Song;
import com.moodtune.repository.PlaylistRepository;
import com.moodtune.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final SongRepository songRepository;

    public Playlist createPlaylist(String name, String mood, String userId) {
        Playlist playlist = Playlist.builder()
                .name(name)
                .mood(mood.toUpperCase())
                .userId(userId)
                .description("Auto-generated " + mood + " playlist")
                .build();
        return playlistRepository.save(playlist);
    }

    public List<Playlist> getUserPlaylists(String userId) {
        return playlistRepository.findByUserId(userId);
    }

    public Playlist addSongToPlaylist(Long playlistId, Long songId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new RuntimeException("Song not found"));

        if (!playlist.getSongs().contains(song)) {
            playlist.getSongs().add(song);
        }
        return playlistRepository.save(playlist);
    }

    public Playlist removeSongFromPlaylist(Long playlistId, Long songId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));
        playlist.getSongs().removeIf(s -> s.getId().equals(songId));
        return playlistRepository.save(playlist);
    }

    public void deletePlaylist(Long playlistId) {
        playlistRepository.deleteById(playlistId);
    }

    public Optional<Playlist> getPlaylist(Long id) {
        return playlistRepository.findById(id);
    }
}