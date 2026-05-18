package com.moodtune;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MoodTuneApplication {
	public static void main(String[] args) {
		SpringApplication.run(MoodTuneApplication.class, args);
		System.out.println("🎵 MoodTunes is running on http://localhost:8080");
	}
}