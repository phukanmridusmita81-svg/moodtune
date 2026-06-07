package com.moodtune.controller;

import com.moodtune.service.JioSaavnService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Map;

@RestController
@RequestMapping("/api/music")
@RequiredArgsConstructor
@Slf4j
public class MusicController {

    private final JioSaavnService jioSaavnService;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * GET /api/music/stream?title=Tum+Hi+Ho&artist=Arijit+Singh
     * Returns JSON with streamUrl and metadata — browser plays the URL via /api/music/proxy
     */
    @GetMapping("/stream")
    public ResponseEntity<Map<String, Object>> getStream(
            @RequestParam String title,
            @RequestParam String artist) {

        Map<String, Object> result = jioSaavnService.searchAndGetStream(title, artist);
        String streamUrl = (String) result.getOrDefault("streamUrl", "");
        boolean isFallback = (boolean) result.getOrDefault("fallback", false);

        if (streamUrl.isEmpty()) {
            return ResponseEntity.status(404).body(result);
        }

        // Replace raw CDN url with our proxy endpoint so browser never hits CDN directly
        // This solves CORS: browser fetches audio from the backend instead of a third-party host.
        String encoded = java.net.URLEncoder.encode(streamUrl, java.nio.charset.StandardCharsets.UTF_8);
        String proxyUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/music/proxy")
                .queryParam("url", encoded)
                .build(true)
                .toUriString();
        result.put("streamUrl", proxyUrl);

        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/music/proxy?url=...
     * Proxies the JioSaavn CDN audio stream to the browser.
     * Supports Range requests so seek works correctly.
     */
    @GetMapping("/proxy")
    public ResponseEntity<byte[]> proxyAudio(
            @RequestParam String url,
            @RequestHeader(value = "Range", required = false) String rangeHeader) {
        try {
            log.info("Proxying audio: {}", url.substring(0, Math.min(url.length(), 80)));

            HttpHeaders reqHeaders = new HttpHeaders();
            reqHeaders.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            reqHeaders.set("Accept", "*/*");
            reqHeaders.set("Referer", "https://www.jiosaavn.com/");

            // Forward Range header if browser wants to seek
            if (rangeHeader != null && !rangeHeader.isEmpty()) {
                reqHeaders.set("Range", rangeHeader);
            }

            ResponseEntity<byte[]> upstream = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(reqHeaders), byte[].class
            );

            HttpHeaders respHeaders = new HttpHeaders();
            respHeaders.set("Content-Type",
                    upstream.getHeaders().getContentType() != null
                            ? upstream.getHeaders().getContentType().toString()
                            : "audio/mpeg");
            respHeaders.set("Accept-Ranges", "bytes");
            respHeaders.set("Access-Control-Allow-Origin", "*");
            // Forward Content-Range if present (for ranged responses)
            String contentRange = upstream.getHeaders().getFirst("Content-Range");
            if (contentRange != null) respHeaders.set("Content-Range", contentRange);

            HttpStatus status = rangeHeader != null
                    ? HttpStatus.PARTIAL_CONTENT
                    : HttpStatus.OK;

            return new ResponseEntity<>(upstream.getBody(), respHeaders, status);

        } catch (Exception e) {
            log.error("Audio proxy failed: {}", e.getMessage());
            return ResponseEntity.status(502).build();
        }
    }
}
