package com.moodtune.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

@Service
@Slf4j
public class JioSaavnService {

    private final RestTemplate rest   = new RestTemplate(requestFactory());
    private final ObjectMapper  mapper = new ObjectMapper();
    private static final List<String> BASE_URLS = List.of(
            "https://saavn.sumit.co/api",
            "https://saavn.dev/api"
    );

    private static SimpleClientHttpRequestFactory requestFactory() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        return factory;
    }

    public Map<String, Object> searchAndGetStream(String title, String artist) {
        Map<String, Object> result = doSearch(title + " " + artist, title, artist, true);
        if (result != null) return result;
        result = doSearch(title, title, artist, false);
        if (result != null) return result;
        return errorMap("Song not found on JioSaavn: " + title);
    }

    private Map<String, Object> doSearch(String query, String requestedTitle, String requestedArtist, boolean strict) {
        try {
            String cleaned = query.trim()
                    .replaceAll("[^\\p{L}\\p{N}\\s]", " ")
                    .replaceAll("\\s+", " ");

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            headers.set("Accept", "application/json,text/plain,*/*");

            for (String base : BASE_URLS) {
                String url = UriComponentsBuilder.fromHttpUrl(base + "/search/songs")
                        .queryParam("query", cleaned)
                        .queryParam("limit", 8)
                        .build()
                        .encode()
                        .toUriString();
                log.info("JioSaavn search: {}", url);

                try {
                    ResponseEntity<String> res = rest.exchange(
                            url, HttpMethod.GET, new HttpEntity<>(headers), String.class
                    );

                    JsonNode root = mapper.readTree(res.getBody());
                    JsonNode results = root.path("data").path("results");

                    if (!results.isArray() || results.isEmpty()) continue;

                    Map<String, Object> best = null;
                    int bestScore = Integer.MIN_VALUE;

                    for (JsonNode song : results) {
                        Map<String, Object> extracted = extractSong(song);
                        if (extracted == null) continue;

                        int score = scoreCandidate(extracted, requestedTitle, requestedArtist);
                        log.debug("JioSaavn candidate score {}: {} - {}",
                                score, extracted.get("title"), extracted.get("artist"));

                        if (score > bestScore) {
                            bestScore = score;
                            best = extracted;
                        }
                    }

                    int minScore = strict ? 45 : 45;
                    if (best != null && bestScore >= minScore) return best;
                } catch (Exception e) {
                    log.warn("JioSaavn search failed for {}: {}", base, e.getMessage());
                }
            }
            return null;

        } catch (Exception e) {
            log.error("JioSaavn search failed: {}", e.getMessage());
            return null;
        }
    }

    private int scoreCandidate(Map<String, Object> song, String requestedTitle, String requestedArtist) {
        String title = normalize(String.valueOf(song.getOrDefault("title", "")));
        String artist = normalize(String.valueOf(song.getOrDefault("artist", "")));
        String album = normalize(String.valueOf(song.getOrDefault("album", "")));
        String wantedTitle = normalize(requestedTitle);
        String wantedArtist = normalize(requestedArtist);
        String combined = title + " " + artist + " " + album;

        int score = 0;
        if (title.equals(wantedTitle)) score += 70;
        else if (title.contains(wantedTitle) || wantedTitle.contains(title)) score += 35;

        for (String token : wantedTitle.split(" ")) {
            if (token.length() > 2 && title.contains(token)) score += 4;
        }

        if (!wantedArtist.isBlank()) {
            boolean artistMatched = false;
            if (artist.contains(wantedArtist) || wantedArtist.contains(artist)) score += 45;
            else {
                for (String token : wantedArtist.split(" ")) {
                    if (token.length() > 2 && artist.contains(token)) {
                        artistMatched = true;
                        score += 12;
                    }
                }
            }

            if (artist.contains(wantedArtist) || wantedArtist.contains(artist)) {
                artistMatched = true;
            }
            if (!artistMatched) score -= 35;
        }

        if (isUnwantedVersion(combined) && !isUnwantedVersion(wantedTitle + " " + wantedArtist)) {
            score -= 100;
        }

        return score;
    }

    private boolean isUnwantedVersion(String value) {
        return value.contains("karaoke")
                || value.contains("instrumental")
                || value.contains("female key")
                || value.contains("male key")
                || value.contains("tribute")
                || value.contains("cover version")
                || value.contains("remix");
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT)
                .replaceAll("&amp;", " and ")
                .replaceAll("[^\\p{L}\\p{N}\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private Map<String, Object> extractSong(JsonNode song) {
        try {
            JsonNode downloadUrls = song.path("downloadUrl");
            String streamUrl = "";

            if (downloadUrls.isArray()) {
                for (int i = downloadUrls.size() - 1; i >= 0; i--) {
                    String url = downloadUrls.get(i).path("url").asText("");
                    if (!url.isEmpty() && !url.equals("null")) {
                        streamUrl = url;
                        break;
                    }
                }
            }

            if (streamUrl.isEmpty()) return null;

            String imageUrl = "";
            JsonNode images = song.path("image");
            if (images.isArray() && images.size() > 0) {
                imageUrl = images.get(images.size() - 1).path("url").asText("");
            }

            StringBuilder artists = new StringBuilder();
            JsonNode artistArr = song.path("artists").path("primary");
            if (artistArr.isArray()) {
                for (JsonNode a : artistArr) {
                    if (artists.length() > 0) artists.append(", ");
                    artists.append(a.path("name").asText(""));
                }
            }

            String name     = song.path("name").asText("");
            String duration = song.path("duration").asText("0");
            String album    = song.path("album").path("name").asText("");

            log.info("JioSaavn stream found: {}", name);

            Map<String, Object> m = new HashMap<>();
            m.put("streamUrl", streamUrl);
            m.put("imageUrl",  imageUrl);
            m.put("title",     name);
            m.put("artist",    artists.toString());
            m.put("album",     album);
            m.put("duration",  duration);
            return m;

        } catch (Exception e) {
            log.warn("Extract failed: {}", e.getMessage());
            return null;
        }
    }

    private Map<String, Object> errorMap(String msg) {
        log.warn(msg);
        Map<String, Object> m = new HashMap<>();
        m.put("streamUrl", "");
        m.put("imageUrl", "");
        m.put("title", "");
        m.put("artist", "");
        m.put("album", "");
        m.put("duration", "0");
        m.put("error", msg);
        m.put("fallback", false);
        return m;
    }
}
