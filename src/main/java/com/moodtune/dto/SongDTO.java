package com.moodtune.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SongDTO {
    private Long id;
    private String title;
    private String artist;
    private String album;
    private String youtubeId;
    private String thumbnailUrl;
    private String mood;
    private String genre;
    private Integer duration;
    private Long playCount;
}