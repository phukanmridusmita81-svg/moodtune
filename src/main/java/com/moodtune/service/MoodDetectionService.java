package com.moodtune.service;

import com.moodtune.dto.MoodRequest;
import com.moodtune.dto.MoodResponse;
import com.moodtune.model.MoodLog;
import com.moodtune.repository.MoodLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MoodDetectionService {

    private final MoodLogRepository moodLogRepository;

    // ─── Mood Keyword Maps ──────────────────────────────────────────────────
    private static final Map<String, List<String>> MOOD_KEYWORDS = new LinkedHashMap<>();
    private static final Map<String, List<String>> MOOD_EMOJIS   = new LinkedHashMap<>();

    static {
        // HAPPY
        MOOD_KEYWORDS.put("HAPPY", Arrays.asList(
                "happy", "khush", "joy", "excited", "great", "amazing", "wonderful",
                "fun", "party", "celebrate", "good", "fantastic", "awesome", "blessed",
                "cheerful", "elated", "thrilled", "delighted", "mast", "badhiya",
                "zindagi", "dance", "enjoy", "smile", "laugh"
        ));
        MOOD_EMOJIS.put("HAPPY", Arrays.asList(
                "😊", "😄", "😁", "🎉", "🥳", "🙌", "💯", "🎊", "😃", "🤩", "🥰", "✨"
        ));

        // SAD
        MOOD_KEYWORDS.put("SAD", Arrays.asList(
                "sad", "dukhi", "cry", "crying", "lonely", "alone", "miss", "missing",
                "hurt", "broken", "heartbreak", "depressed", "unhappy", "miserable",
                "tears", "grief", "pain", "sorrow", "lost", "empty", "bura", "dard",
                "yaad", "rone", "akela", "tanha", "udaas"
        ));
        MOOD_EMOJIS.put("SAD", Arrays.asList(
                "😢", "😭", "💔", "😔", "😞", "🥺", "😿", "💧", "🌧️", "😓"
        ));

        // ENERGETIC
        MOOD_KEYWORDS.put("ENERGETIC", Arrays.asList(
                "energy", "energetic", "gym", "workout", "run", "exercise", "hype",
                "fire", "pumped", "motivated", "beast", "power", "strong", "grind",
                "hustle", "lets go", "boss", "warrior", "fight", "intense", "josh",
                "tez", "powerful", "garmi", "dhoom"
        ));
        MOOD_EMOJIS.put("ENERGETIC", Arrays.asList(
                "💪", "🔥", "⚡", "🏋️", "🎯", "🚀", "💥", "🤜", "⚡", "🦁"
        ));

        // CALM
        MOOD_KEYWORDS.put("CALM", Arrays.asList(
                "calm", "relax", "relaxed", "chill", "peaceful", "sleep", "rest",
                "meditate", "quiet", "serene", "tranquil", "easy", "slow", "gentle",
                "lo-fi", "lofi", "study", "focus", "breathe", "shanti", "sukoon",
                "aram", "neend", "so jao", "raat"
        ));
        MOOD_EMOJIS.put("CALM", Arrays.asList(
                "😌", "🧘", "🌙", "✨", "🍃", "🌊", "🕯️", "☁️", "🌸", "💤"
        ));

        // ROMANTIC
        MOOD_KEYWORDS.put("ROMANTIC", Arrays.asList(
                "love", "romantic", "romance", "pyaar", "ishq", "mohabbat", "date",
                "crush", "girlfriend", "boyfriend", "heart", "darling", "sweetheart",
                "valentine", "kiss", "hug", "together", "forever", "beautiful", "sunset",
                "candle", "dinner", "propose", "wedding", "shadi"
        ));
        MOOD_EMOJIS.put("ROMANTIC", Arrays.asList(
                "💕", "❤️", "🌹", "😍", "💑", "💋", "🥰", "💖", "💗", "❣️"
        ));

        // ANGRY
        MOOD_KEYWORDS.put("ANGRY", Arrays.asList(
                "angry", "anger", "mad", "frustrated", "annoy", "irritated", "hate",
                "rage", "furious", "gussa", "naraz", "chidh", "krodh", "bakwas",
                "nonsense", "stupid", "idiot", "worst", "terrible", "awful"
        ));
        MOOD_EMOJIS.put("ANGRY", Arrays.asList(
                "😠", "😤", "🤬", "😡", "💢", "👊", "🔥", "⚡"
        ));

        // FOCUS
        MOOD_KEYWORDS.put("FOCUS", Arrays.asList(
                "focus", "concentrate", "study", "work", "deep work", "productive",
                "deadline", "exam", "coding", "reading", "writing", "thinking",
                "padhai", "kaam", "office", "meeting", "project", "assignment"
        ));
        MOOD_EMOJIS.put("FOCUS", Arrays.asList(
                "🎯", "📚", "💻", "🧠", "📝", "⏰", "☕", "🔍"
        ));
    }

    // ─── Mood Metadata ──────────────────────────────────────────────────────
    private static final Map<String, String> MOOD_EMOJI_DISPLAY = Map.of(
            "HAPPY",     "😊",
            "SAD",       "😢",
            "ENERGETIC", "💪",
            "CALM",      "😌",
            "ROMANTIC",  "❤️",
            "ANGRY",     "😤",
            "FOCUS",     "🎯"
    );

    private static final Map<String, String> MOOD_COLOR = Map.of(
            "HAPPY",     "#FFD700",
            "SAD",       "#4A90E2",
            "ENERGETIC", "#FF4500",
            "CALM",      "#7EC8E3",
            "ROMANTIC",  "#FF6B9D",
            "ANGRY",     "#DC143C",
            "FOCUS",     "#9B59B6"
    );

    private static final Map<String, String> MOOD_DESC = Map.of(
            "HAPPY",     "You're feeling joyful! Time for some upbeat tunes! 🎉",
            "SAD",       "Feeling down? Music heals — here's something soothing 💙",
            "ENERGETIC", "Beast mode ON! Let's fuel that energy! 🔥",
            "CALM",      "Peaceful vibes detected. Sit back and relax 🌙",
            "ROMANTIC",  "Love is in the air! Here's something special 💕",
            "ANGRY",     "Let it out! Some power tunes coming your way 💢",
            "FOCUS",     "Deep focus mode. Lo-fi and instrumental tracks for you 🎯"
    );

    private static final Map<String, List<String>> MOOD_GENRES = Map.of(
            "HAPPY",     Arrays.asList("pop", "bollywood-happy", "dance", "funk"),
            "SAD",       Arrays.asList("emotional", "bollywood-sad", "indie", "soul"),
            "ENERGETIC", Arrays.asList("hip-hop", "edm", "rock", "workout"),
            "CALM",      Arrays.asList("lofi", "ambient", "jazz", "classical"),
            "ROMANTIC",  Arrays.asList("rnb", "bollywood-romantic", "soul", "pop"),
            "ANGRY",     Arrays.asList("metal", "rock", "rap", "punk"),
            "FOCUS",     Arrays.asList("lofi", "classical", "instrumental", "ambient")
    );

    // ─── Main Detection Method ──────────────────────────────────────────────
    public MoodResponse detectMood(MoodRequest request) {
        String input = request.getText().toLowerCase().trim();
        log.debug("Detecting mood for input: {}", input);

        Map<String, Double> moodScores = new HashMap<>();
        List<String> detectedKeywords = new ArrayList<>();

        // Score each mood
        for (Map.Entry<String, List<String>> entry : MOOD_KEYWORDS.entrySet()) {
            String mood = entry.getKey();
            double score = 0.0;

            for (String keyword : entry.getValue()) {
                if (input.contains(keyword)) {
                    score += 1.0;
                    detectedKeywords.add(keyword);
                }
            }

            // Check emojis too
            for (String emoji : MOOD_EMOJIS.get(mood)) {
                if (request.getText().contains(emoji)) {
                    score += 1.5; // Emojis get higher weight
                }
            }

            moodScores.put(mood, score);
        }

        // Find highest scoring mood
        String detectedMood = moodScores.entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("HAPPY"); // Default fallback

        double maxScore = moodScores.get(detectedMood);

        // If no keywords matched at all, do sentiment-based fallback
        if (maxScore == 0) {
            detectedMood = fallbackDetection(input);
        }

        // Calculate confidence
        double totalScore = moodScores.values().stream().mapToDouble(Double::doubleValue).sum();
        double confidence = totalScore > 0 ? Math.min(maxScore / totalScore, 1.0) : 0.5;

        // Log to database
        saveMoodLog(request.getText(), detectedMood, confidence, request.getSessionId());

        return MoodResponse.builder()
                .mood(detectedMood)
                .moodEmoji(MOOD_EMOJI_DISPLAY.get(detectedMood))
                .moodColor(MOOD_COLOR.get(detectedMood))
                .confidence(Math.round(confidence * 100.0) / 100.0)
                .description(MOOD_DESC.get(detectedMood))
                .genres(MOOD_GENRES.get(detectedMood))
                .keywords(detectedKeywords)
                .build();
    }

    // Simple fallback based on text length and punctuation
    private String fallbackDetection(String input) {
        if (input.contains("!") || input.contains("...") ||
                input.length() < 5) return "HAPPY";
        if (input.endsWith("?")) return "FOCUS";
        return "CALM";
    }

    private void saveMoodLog(String input, String mood, double confidence, String sessionId) {
        MoodLog log = MoodLog.builder()
                .userInput(input)
                .detectedMood(mood)
                .confidence(confidence)
                .sessionId(sessionId)
                .build();
        moodLogRepository.save(log);
    }

    // Get mood history stats
    public Map<String, Long> getMoodStats() {
        List<MoodLog> logs = moodLogRepository.findAll();
        Map<String, Long> stats = new LinkedHashMap<>();
        for (String mood : MOOD_KEYWORDS.keySet()) {
            long count = logs.stream()
                    .filter(l -> mood.equals(l.getDetectedMood()))
                    .count();
            stats.put(mood, count);
        }
        return stats;
    }
}