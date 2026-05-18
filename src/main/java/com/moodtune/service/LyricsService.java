package com.moodtune.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class LyricsService {

    private final WebClient.Builder webClientBuilder;

    // Uses lyrics.ovh — FREE, no API key needed!
    public String getLyrics(String artist, String title) {
        try {
            String url = "https://api.lyrics.ovh/v1/" +
                    encode(artist) + "/" + encode(title);

            WebClient client = webClientBuilder.build();

            Map response = client.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .onErrorResume(e -> {
                        log.warn("Lyrics not found for: {} - {}", artist, title);
                        return Mono.just(Map.of("lyrics", "Lyrics not available for this song."));
                    })
                    .block();

            if (response != null && response.containsKey("lyrics")) {
                return (String) response.get("lyrics");
            }
        } catch (Exception e) {
            log.error("Error fetching lyrics", e);
        }
        return "Lyrics not available. Try searching on Genius.com!";
    }

    private String encode(String s) {
        return s.trim().replace(" ", "%20").replace("&", "and");
    }
}