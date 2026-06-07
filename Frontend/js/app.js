// ─── Config ────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8082/api';
const YT_API_KEY = 'AIzaSyDonSHnYCo1suXuKMTdHYwMb0h5tF-LlCQ';

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
  try {
    const res = await fetch(`${API_BASE}/mood/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sessionId: SESSION_ID })
    });
    if (!res.ok) throw new Error('Backend error ' + res.status);
    return res.json();
  } catch (e) {
    showToast('⚠️ Backend not reachable. Is Spring Boot running on port 8082?', 'error');
    // FIX: return a client-side fallback instead of crashing
    return clientSideMoodDetect(text);
  }
}

// FIX: client-side mood fallback when backend is down
function clientSideMoodDetect(text) {
  const t = text.toLowerCase();
  let mood = 'HAPPY';
  if (t.includes('sad') || t.includes('cry') || t.includes('lonely') || t.includes('💔') || t.includes('😢') || t.includes('😭')) mood = 'SAD';
  else if (t.includes('gym') || t.includes('workout') || t.includes('energy') || t.includes('💪') || t.includes('🔥')) mood = 'ENERGETIC';
  else if (t.includes('calm') || t.includes('relax') || t.includes('chill') || t.includes('😌')) mood = 'CALM';
  else if (t.includes('love') || t.includes('pyaar') || t.includes('romance') || t.includes('❤️') || t.includes('💕')) mood = 'ROMANTIC';
  else if (t.includes('angry') || t.includes('mad') || t.includes('gussa') || t.includes('😤') || t.includes('😠')) mood = 'ANGRY';
  else if (t.includes('focus') || t.includes('study') || t.includes('work') || t.includes('🎯')) mood = 'FOCUS';
  const m = MOOD_META[mood];
  const descs = {
    HAPPY:'You\'re feeling joyful! Time for some upbeat tunes! 🎉',
    SAD:'Feeling down? Music heals — here\'s something soothing 💙',
    ENERGETIC:'Beast mode ON! Let\'s fuel that energy! 🔥',
    CALM:'Peaceful vibes detected. Sit back and relax 🌙',
    ROMANTIC:'Love is in the air! Here\'s something special 💕',
    ANGRY:'Let it out! Some power tunes coming your way 💢',
    FOCUS:'Deep focus mode. Lo-fi and instrumental tracks for you 🎯'
  };
  return { mood, moodEmoji: m.emoji, moodColor: m.color, confidence: 0.7, description: descs[mood], genres: [], keywords: [] };
}

async function getSongsByMood(mood) {
  try {
    const res = await fetch(`${API_BASE}/songs/mood/${mood}`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Bad response');
    return data;
  } catch (e) {
    showToast('⚠️ Could not load songs. Is the backend running?', 'error');
    return [];
  }
}

async function getTrendingSongs() {
  try {
    const res = await fetch(`${API_BASE}/songs/trending`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Bad response');
    return data;
  } catch (e) {
    console.warn('Could not load trending songs:', e.message);
    return [];
  }
}

async function getLyrics(artist, title) {
  try {
    const res = await fetch(`${API_BASE}/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
    return res.json();
  } catch { return { lyrics: '' }; }
}

async function incrementPlay(songId) {
  try {
    await fetch(`${API_BASE}/songs/${songId}/play`, { method: 'POST' });
  } catch { /* non-critical, ignore */ }
}

async function getUserPlaylists() {
  try {
    const res = await fetch(`${API_BASE}/playlists/user/${SESSION_ID}`);
    return res.json();
  } catch { return []; }
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
    max-width: 340px;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function renderSongCard(song, onclick) {
  // FIX: thumbnailUrl is already set by SongService.toDTO(); use it directly
  const thumb = song.thumbnailUrl || `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`;
  const meta = MOOD_META[song.mood] || MOOD_META.HAPPY;
  const duration = song.duration ? formatDuration(song.duration) : '';
  const card = document.createElement('div');
  card.className = 'song-card fade-up';
  card.innerHTML = `
    <img src="${thumb}" alt="${song.title}" loading="lazy"
         onerror="this.src='https://placehold.co/300x300/0f0f1e/7c3aed?text=🎵'">
    <div class="song-title">${song.title}</div>
    <div class="song-artist">${song.artist}</div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px;">
      <span class="mood-badge" style="${getMoodBadgeStyle(song.mood)}">${meta.emoji} ${song.mood}</span>
      ${duration ? `<span style="font-size:.75rem;color:#9090b0;">${duration}</span>` : ''}
    </div>
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
