# 🎵 MoodTunes

> A mood-based Bollywood music discovery app — find the perfect song for every emotion.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| 🎨 Frontend | https://moodtune-frontend-f70c.onrender.com |
| ⚙️ Backend API | https://moodtune-backend-b76r.onrender.com |

---

## 📖 About

MoodTunes is a full-stack music web application that lets users discover Bollywood songs based on their current mood. Whether you're feeling Happy, Sad, Romantic, or Energetic — MoodTunes curates the perfect playlist for you, powered by a custom Spring Boot REST API and a clean Vanilla JS frontend.

---

## ✨ Features

- 🎭 **Mood-Based Discovery** — Browse songs by mood: Happy, Sad, Romantic, Energetic
- 🔥 **Trending Songs** — Real-time trending chart based on play counts
- 🎬 **YouTube Playback** — Songs stream directly via YouTube integration
- 📀 **Genre Filtering** — Filter by Bollywood sub-genres (Rap, Energy, Romantic, etc.)
- 🖼️ **Album Art** — Auto-fetched thumbnails for every track
- 📱 **Responsive UI** — Works across desktop and mobile

---

## 🛠️ Tech Stack

### Backend
- **Java 17** + **Spring Boot 3**
- **Spring Web** — REST API
- **Spring Data JPA** — Database ORM
- **MySQL** — Song data persistence
- **Maven** — Build tool

### Frontend
- **Vanilla JavaScript** — No framework, pure JS
- **HTML5 + CSS3** — Clean responsive UI
- **YouTube iFrame API** — Audio/video playback

### DevOps
- **Render** — Backend deployment (Web Service)
- **UptimeRobot** — Keep-alive monitoring

---

## 📡 API Endpoints

Base URL: `https://moodtune-backend-b76r.onrender.com`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/songs/trending` | Get top trending songs by play count |
| GET | `/api/songs/mood/{mood}` | Get songs by mood (HAPPY, SAD, ROMANTIC, ENERGETIC) |
| GET | `/api/songs/{id}` | Get a single song by ID |

### Mood Values
`HAPPY` · `SAD` · `ROMANTIC` · `ENERGETIC`

### Sample Response (`/api/songs/trending`)
```json
[
  {
    "id": 1,
    "title": "Kala Chashma",
    "artist": "Amar Arshi, Badshah, Neha Kakkar",
    "album": "Baar Baar Dekho",
    "youtubeId": "k4yXQkG2s1E",
    "thumbnailUrl": "https://img.youtube.com/vi/k4yXQkG2s1E/mqdefault.jpg",
    "mood": "HAPPY",
    "genre": "bollywood-happy",
    "duration": 187,
    "playCount": 94
  }
]
```

---

## 🚀 Local Setup

### Prerequisites
- Java 17+
- MySQL 8+
- Maven 3.8+

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/phukanmridusmita81-svg/moodtunes.git
cd moodtunes/backend

# Configure database in application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/moodtunes
spring.datasource.username=root
spring.datasource.password=yourpassword

# Run the backend
mvn spring-boot:run
```

Backend starts at `http://localhost:8080`

### Frontend Setup

```bash
cd moodtunes/frontend

# Open index.html directly in browser
# OR serve with Live Server (VS Code extension)
```

> Update the API base URL in your JS config to `http://localhost:8080` for local development.

---

## 📁 Project Structure

```
moodtunes/
├── backend/
│   ├── src/
│   │   ├── main/java/com/moodtunes/
│   │   │   ├── controller/      # REST Controllers
│   │   │   ├── service/         # Business Logic
│   │   │   ├── repository/      # JPA Repositories
│   │   │   └── model/           # Entity Classes
│   │   └── resources/
│   │       └── application.properties
│   └── pom.xml
└── frontend/
    ├── index.html
    ├── style.css
    └── app.js
```

---

## 🎭 Mood Categories

| Mood | Genre Tags | Example Songs |
|---|---|---|
| 😄 HAPPY | bollywood-happy | Kala Chashma, Badtameez Dil |
| 😢 SAD | bollywood-sad | Tum Hi Ho, Channa Mereya |
| 💕 ROMANTIC | bollywood-romantic | Kesariya, Raabta, Gerua |
| ⚡ ENERGETIC | bollywood-energy, bollywood-rap | Malhari, Apna Time Aayega |

---

## 🔧 Deployment Notes

- Backend is deployed on **Render Free Tier** (spins down after 15 min inactivity)
- **UptimeRobot** pings `/api/songs/trending` every 5 minutes to keep it alive
- Frontend is served as a **static site** — always available, no cold start

---

## 👨‍💻 Author

**Mridusmita Phukan**
B.Tech · KIIT Bhubaneswar · 2027
- GitHub: [@phukanmridusmita81-svg](https://github.com/phukanmridusmita81-svg)
- LinkedIn: [Mridusmita Phukan](https://www.linkedin.com/in/mridusmita-phukan-83a4832b3)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
