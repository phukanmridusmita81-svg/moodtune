// ─── Config ────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8080/api';
const YT_API_KEY = 'AIzaSyDonSHnYCo1suXuKMTdHYwMb0h5tF-LlCQ'; // Google Cloud Console se lo

// ─── Session ID (per user) ─────────────────────────────────────────────────
const SESSION_ID = localStorage.getItem('moodtunes_session') || (() => {
  const id = 'session_' + Math.random().toString(36).slice(2, 11);
  localStorage.setItem('moodtunes_session', id);
  return id;
})();

// ─── Mood Colors ───────────────────────────────────────────────────────────
const MOOD_META = {
  HAPPY:     { color: '#FFD700', emoji: '😊', gradient: 'linear-gradient(135deg, #FFD700, #FF8C00)' },
  SAD:       { color: '#4A90E2', emoji: '😢', gradient: 'linear-gradient(135deg, #4A90E2, #1e3a5f)' },
  ENERGETIC: { color: '#FF4500', emoji: '💪', gradient: 'linear-gradient(135deg, #FF4500, #FF0080)' },
  CALM:      { color: '#7EC8E3', emoji: '😌', gradient: 'linear-gradient(135deg, #7EC8E3, #0077B6)' },
  ROMANTIC:  { color: '#FF6B9D', emoji: '❤️', gradient: 'linear-gradient(135deg, #FF6B9D, #C2185B)' },
  ANGRY:     { color: '#DC143C', emoji: '😤', gradient: 'linear-gradient(135deg, #DC143C, #7B0000)' },
  FOCUS:     { color: '#9B59B6', emoji: '🎯', gradient: 'linear-gradient(135deg, #9B59B6, #2980B9)' },
};

// ─── API Calls ─────────────────────────────────────────────────────────────

async function detectMood(text) {
  const res = await fetch(`${API_BASE}/mood/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sessionId: SESSION_ID })
  });
  return res.json();
}

async function getSongsByMood(mood) {
  const res = await fetch(`${API_BASE}/songs/mood/${mood}`);
  return res.json();
}

async function getTrendingSongs() {
  const res = await fetch(`${API_BASE}/songs/trending`);
  return res.json();
}

async function getLyrics(artist, title) {
  const res = await fetch(`${API_BASE}/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
  return res.json();
}

async function incrementPlay(songId) {
  await fetch(`${API_BASE}/songs/${songId}/play`, { method: 'POST' });
}

async function getUserPlaylists() {
  const res = await fetch(`${API_BASE}/playlists/user/${SESSION_ID}`);
  return res.json();
}

async function createPlaylist(name, mood) {
  const res = await fetch(`${API_BASE}/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mood, userId: SESSION_ID })
  });
  return res.json();
}

async function addSongToPlaylist(playlistId, songId) {
  const res = await fetch(`${API_BASE}/playlists/${playlistId}/songs/${songId}`, { method: 'POST' });
  return res.json();
}

// ─── Player State ───────────────────────────────────────────────────────────
let player = {
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  currentSong: null,
};

// ─── Utility Functions ──────────────────────────────────────────────────────

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getMoodBadgeStyle(mood) {
  const m = MOOD_META[mood] || MOOD_META.HAPPY;
  return `background: ${m.color}22; color: ${m.color}; border: 1px solid ${m.color}44;`;
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 90px; right: 20px; z-index: 9999;
    padding: 0.75rem 1.5rem;
    background: ${type === 'error' ? '#DC143C' : 'linear-gradient(135deg, #7c3aed, #06b6d4)'};
    color: white; border-radius: 12px;
    font-family: 'Syne', sans-serif; font-weight: 700;
    animation: fadeUp 0.3s ease;
    box-shadow: 0 8px 30px rgba(124,58,237,0.4);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function renderSongCard(song, onclick) {
  const thumb = song.thumbnailUrl || `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`;
  const meta = MOOD_META[song.mood] || MOOD_META.HAPPY;
  const card = document.createElement('div');
  card.className = 'song-card fade-up';
  card.innerHTML = `
    <img src="${thumb}" alt="${song.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x300/0f0f1e/7c3aed?text=🎵'">
    <div class="song-title">${song.title}</div>
    <div class="song-artist">${song.artist}</div>
    <span class="mood-badge" style="${getMoodBadgeStyle(song.mood)}">${meta.emoji} ${song.mood}</span>
  `;
  card.addEventListener('click', () => onclick(song));
  return card;
}

// ─── Navigate to Player ─────────────────────────────────────────────────────
function playInPlayer(song, queue = []) {
  localStorage.setItem('moodtunes_current_song', JSON.stringify(song));
  localStorage.setItem('moodtunes_queue', JSON.stringify(queue));
  window.location.href = 'player.html';
}

// ─── Set Active Nav ─────────────────────────────────────────────────────────
(function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });
})();