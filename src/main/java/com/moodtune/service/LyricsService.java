package com.moodtune.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.HtmlUtils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Service
@Slf4j
public class LyricsService {

    private final RestTemplate rest   = new RestTemplate(requestFactory());
    private final ObjectMapper  mapper = new ObjectMapper();

    private static SimpleClientHttpRequestFactory requestFactory() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(4000);
        factory.setReadTimeout(7000);
        return factory;
    }

    public String getLyrics(String artist, String title) {

        // Method 1: lrclib.net (reliable, free)
        for (String rawQuery : new String[] {
                title + " " + artist,
                cleanTitle(title) + " " + artist,
                cleanTitle(title)
        }) {
            try {
            String query = URLEncoder.encode(rawQuery.trim(), StandardCharsets.UTF_8);
            String url = "https://lrclib.net/api/search?q=" + query;
            log.info("lrclib search: {}", url);

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "MoodTunes/1.0 (github.com/moodtunes)");
            headers.set("Accept", "application/json");

            ResponseEntity<String> response = rest.exchange(
                url, HttpMethod.GET, new HttpEntity<>(headers), String.class
            );

            String body = response.getBody();
            if (body != null && !body.equals("[]")) {
                JsonNode arr = mapper.readTree(body);
                if (arr.isArray() && arr.size() > 0) {
                    for (JsonNode item : arr) {
                        String plainLyrics = item.path("plainLyrics").asText("").trim();
                        if (!plainLyrics.isEmpty() && plainLyrics.length() > 20) {
                            log.info("Lyrics found via lrclib for: {} - {}", artist, title);
                            return plainLyrics;
                        }
                    }
                }
            }
            } catch (Exception e) {
                log.warn("lrclib failed: {}", e.getMessage());
            }
        }

        // Method 2: JioSaavn fallback for Hindi/Bollywood songs
        String jioSaavnLyrics = getJioSaavnLyrics(artist, title);
        if (!jioSaavnLyrics.isBlank()) return jioSaavnLyrics;

        // Method 3: lyrics.ovh fallback
        try {
            String encodedArtist = URLEncoder.encode(artist, StandardCharsets.UTF_8);
            String encodedTitle  = URLEncoder.encode(title,  StandardCharsets.UTF_8);
            String url = "https://api.lyrics.ovh/v1/" + encodedArtist + "/" + encodedTitle;
            log.info("lyrics.ovh fallback: {}", url);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/json");
            headers.set("User-Agent", "Mozilla/5.0");

            ResponseEntity<String> response = rest.exchange(
                url, HttpMethod.GET, new HttpEntity<>(headers), String.class
            );

            String body = response.getBody();
            if (body != null) {
                JsonNode node = mapper.readTree(body);
                String lyrics = node.path("lyrics").asText("").trim();
                if (!lyrics.isEmpty() && lyrics.length() > 20) {
                    log.info("Lyrics found via lyrics.ovh for: {} - {}", artist, title);
                    return lyrics;
                }
            }
        } catch (Exception e) {
            log.warn("lyrics.ovh failed: {}", e.getMessage());
        }

        return "Lyrics not available for this song.";
    }

    private String getJioSaavnLyrics(String artist, String title) {
        try {
            String query = URLEncoder.encode(cleanTitle(title) + " " + artist, StandardCharsets.UTF_8);
            String searchUrl = "https://www.jiosaavn.com/api.php?__call=search.getResults"
                    + "&q=" + query
                    + "&n=5&p=1&ctx=web6dot0&api_version=4&_format=json&_marker=0";
            log.info("JioSaavn lyrics search: {}", searchUrl);

            ResponseEntity<String> searchResponse = rest.exchange(
                    searchUrl, HttpMethod.GET, new HttpEntity<>(jioHeaders()), String.class
            );

            JsonNode results = mapper.readTree(searchResponse.getBody()).path("results");
            if (!results.isArray()) return "";

            String requestedTitle = normalize(cleanTitle(title));
            String requestedArtist = normalize(artist);

            for (JsonNode song : results) {
                String songId = song.path("id").asText("");
                String candidateTitle = normalize(song.path("title").asText(""));
                String candidateSubtitle = normalize(song.path("subtitle").asText(""));
                boolean hasLyrics = "true".equalsIgnoreCase(
                        song.path("more_info").path("has_lyrics").asText("")
                );

                if (songId.isBlank() || !hasLyrics) continue;
                if (!candidateTitle.contains(requestedTitle) && !requestedTitle.contains(candidateTitle)) continue;
                if (!requestedArtist.isBlank() && !candidateSubtitle.contains(requestedArtist)) continue;

                String lyrics = fetchJioSaavnLyricsById(songId);
                if (!lyrics.isBlank()) {
                    log.info("Lyrics found via JioSaavn for: {} - {}", artist, title);
                    return lyrics;
                }
            }
        } catch (Exception e) {
            log.warn("JioSaavn lyrics failed: {}", e.getMessage());
        }
        return "";
    }

    private String fetchJioSaavnLyricsById(String songId) {
        try {
            String lyricsUrl = "https://www.jiosaavn.com/api.php?__call=lyrics.getLyrics"
                    + "&lyrics_id=" + URLEncoder.encode(songId, StandardCharsets.UTF_8)
                    + "&ctx=web6dot0&api_version=4&_format=json&_marker=0";

            ResponseEntity<String> response = rest.exchange(
                    lyricsUrl, HttpMethod.GET, new HttpEntity<>(jioHeaders()), String.class
            );

            String raw = mapper.readTree(response.getBody()).path("lyrics").asText("").trim();
            if (raw.length() < 20) return "";

            return HtmlUtils.htmlUnescape(raw)
                    .replace("<br>", "\n")
                    .replace("<br/>", "\n")
                    .replace("<br />", "\n")
                    .replaceAll("\\n{3,}", "\n\n")
                    .trim();
        } catch (Exception e) {
            log.warn("JioSaavn lyrics by id failed: {}", e.getMessage());
            return "";
        }
    }

    private HttpHeaders jioHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/json,text/plain,*/*");
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
        headers.set("Referer", "https://www.jiosaavn.com/");
        return headers;
    }

    private String normalize(String value) {
        return value == null ? "" : HtmlUtils.htmlUnescape(value)
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^\\p{L}\\p{N}\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String cleanTitle(String title) {
        if (title == null) return "";
        return title
                .replaceAll("(?i)\\s*\\([^)]*(from|movie|original|version|remix|lofi|slowed)[^)]*\\)", "")
                .replaceAll("(?i)\\s*-\\s*(from|movie|original|version|remix|lofi|slowed).*$", "")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
