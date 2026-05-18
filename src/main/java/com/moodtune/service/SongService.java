package com.moodtune.service;

import com.moodtune.dto.SongDTO;
import com.moodtune.model.Song;
import com.moodtune.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SongService {

    private final SongRepository songRepository;

    public List<SongDTO> getSongsByMood(String mood) {
        List<Song> songs = songRepository.findByMoodIgnoreCase(mood);
        return songs.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<SongDTO> getSongsByMoodAndGenre(String mood, String genre) {
        List<Song> songs = songRepository.findByMoodAndGenreIgnoreCase(mood, genre);
        return songs.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<SongDTO> searchSongs(String query) {
        List<Song> songs = songRepository
                .findByTitleContainingIgnoreCaseOrArtistContainingIgnoreCase(query, query);
        return songs.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<SongDTO> getTrendingSongs() {
        List<Song> songs = songRepository.findTop20ByOrderByPlayCountDesc();
        return songs.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public SongDTO incrementPlayCount(Long songId) {
        Optional<Song> optSong = songRepository.findById(songId);
        if (optSong.isPresent()) {
            Song song = optSong.get();
            song.setPlayCount(song.getPlayCount() + 1);
            return toDTO(songRepository.save(song));
        }
        throw new RuntimeException("Song not found: " + songId);
    }

    public SongDTO addSong(SongDTO dto) {
        Song song = Song.builder()
                .title(dto.getTitle())
                .artist(dto.getArtist())
                .album(dto.getAlbum())
                .youtubeId(dto.getYoutubeId())
                .thumbnailUrl(dto.getThumbnailUrl())
                .mood(dto.getMood().toUpperCase())
                .genre(dto.getGenre())
                .duration(dto.getDuration())
                .playCount(0L)
                .build();
        return toDTO(songRepository.save(song));
    }

    private SongDTO toDTO(Song song) {
        return SongDTO.builder()
                .id(song.getId())
                .title(song.getTitle())
                .artist(song.getArtist())
                .album(song.getAlbum())
                .youtubeId(song.getYoutubeId())
                .thumbnailUrl("https://img.youtube.com/vi/" + song.getYoutubeId() + "/mqdefault.jpg")
                .mood(song.getMood())
                .genre(song.getGenre())
                .duration(song.getDuration())
                .playCount(song.getPlayCount())
                .build();
    }
}