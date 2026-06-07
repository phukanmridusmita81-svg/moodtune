// MoodTunes — player.js (FULLY FIXED)
// Backend: http://localhost:8082
// Audio plays via backend proxy → no CORS issues
// No YouTube iframe — clean player only

const BACKEND = 'https://moodtune-backend-b76r.onrender.com';
const audio   = document.getElementById('audioEl');
const QUEUE_VERSION = 'hindi-jiosaavn-v1';

let queue     = [];
let curIdx    = 0;
let isShuffle = false;
let isRepeat  = false;
let isPlaying = false;
let isLoading = false;
let skipCount = 0;
let lyricsRequestId = 0;

// ─── Fetch stream URL from backend (backend proxies audio — no CORS) ─────────
async function getStream(title, artist) {
  try {
    const url = `${BACKEND}/api/music/stream?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`;
    const res  = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const data = await res.json();
    // streamUrl is now /api/music/proxy?url=... — served from localhost, no CORS
    if (data.streamUrl && data.streamUrl.length > 10) return data;
    return null;
  } catch(e) {
    console.warn('Stream fetch error:', e.message);
    return null;
  }
}

function saveQueue() {
  localStorage.setItem('moodtunes_queue', JSON.stringify(queue));
  if (queue[curIdx]) {
    localStorage.setItem('moodtunes_current_song', JSON.stringify(queue[curIdx]));
  } else {
    localStorage.removeItem('moodtunes_current_song');
  }
}

function removeUnavailableSong(index, reason = 'Stream unavailable') {
  const removed = queue[index];
  if (!removed) return;

  queue.splice(index, 1);
  if (curIdx >= queue.length) curIdx = Math.max(0, queue.length - 1);
  saveQueue();
  renderQueue();
  showToast(`Removed "${removed.title}" - ${reason}`);

  if (!queue.length) {
    audio.removeAttribute('src');
    audio.load();
    document.getElementById('songTitle').textContent = 'No playable songs left';
    document.getElementById('songArtist').textContent = 'Try another mood or restart backend';
    document.getElementById('lyricsBox').innerHTML =
      '<div class="lyrics-empty"><div>⚠️</div><p>No lyrics to show.</p></div>';
    return;
  }

  setTimeout(() => loadSong(curIdx, false), 250);
}

function toBackendUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${BACKEND}${url.startsWith('/') ? '' : '/'}${url}`;
}

// ─── Load and play a song ────────────────────────────────────────────────────
async function loadSong(idx, autoplay = false) {
  if (isLoading) return;
  isLoading = true;
  if (!queue.length) { isLoading = false; return; }

  curIdx = Math.max(0, Math.min(idx, queue.length - 1));
  const song = queue[curIdx];
  console.log(`Loading [${idx}]: "${song.title}" by ${song.artist}`);

  // Stop current audio immediately
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  setUI(false);
  showLoading(true);

  // Update song info in UI right away
  document.getElementById('songTitle').textContent  = song.title;
  document.getElementById('songArtist').textContent = song.artist;
  document.getElementById('progFill').style.width   = '0%';
  document.getElementById('curTime').textContent    = '0:00';
  document.getElementById('totTime').textContent    = fmt(song.duration || 0);
  document.getElementById('srcBadge').style.display = 'none';

  // Mood badge
  const C = {HAPPY:'#FFD700',SAD:'#4A90E2',ENERGETIC:'#FF4500',CALM:'#7EC8E3',ROMANTIC:'#FF6B9D',ANGRY:'#DC143C',FOCUS:'#9B59B6'};
  const E = {HAPPY:'😊',SAD:'😢',ENERGETIC:'💪',CALM:'😌',ROMANTIC:'❤️',ANGRY:'😤',FOCUS:'🎯'};
  const mc = C[song.mood] || '#7c3aed';
  const me = E[song.mood] || '🎵';
  document.getElementById('moodBadge').innerHTML =
    `<span class="mbadge" style="background:${mc}22;color:${mc};border:1px solid ${mc}44;">${me} ${song.mood || ''}</span>`;

  // Album art: use thumbnailUrl from DB, fall back to YT thumbnail
  const artUrl = song.thumbnailUrl
    || (song.youtubeId ? `https://img.youtube.com/vi/${song.youtubeId}/maxresdefault.jpg` : '');
  setAlbumArt(artUrl);

  renderQueue();
  saveQueue();

  fetchLyrics(song.artist, song.title);

  // Fetch proxied stream from backend
  const streamData = await getStream(song.title, song.artist);
  showLoading(false);
  isLoading = false;

  if (streamData && streamData.streamUrl) {
    skipCount = 0;

    // Use JioSaavn cover art if available
    if (streamData.imageUrl && streamData.imageUrl.startsWith('http')) {
      setAlbumArt(streamData.imageUrl);
    }

    // Update duration from stream metadata if richer
    if (streamData.duration && parseInt(streamData.duration) > 0) {
      document.getElementById('totTime').textContent = fmt(parseInt(streamData.duration));
    }

    // Show source badge cleanly
    const badge = document.getElementById('srcBadge');
    badge.style.display = 'flex';
    badge.textContent   = '🎵 JioSaavn — Full Song';

    // Set audio source (served from our backend proxy — no CORS)
    audio.src    = toBackendUrl(streamData.streamUrl);
    audio.volume = parseFloat(document.getElementById('volSlider').value || '0.8');

    if (autoplay) {
      // Small delay lets the browser register the new src
      setTimeout(async () => {
        try {
          await audio.play();
        } catch(e) {
          console.warn('Autoplay blocked:', e.message);
          showToast('▶ Click the play button to start');
        }
      }, 150);
    }

  } else {
    // Stream not found — remove from the local queue so it does not keep failing
    skipCount++;
    console.warn(`Stream not found for "${song.title}" (skip #${skipCount})`);

    document.getElementById('songTitle').textContent  = 'Stream unavailable';
    document.getElementById('songArtist').textContent = 'Try another song or check backend logs';
    removeUnavailableSong(curIdx, 'not found on JioSaavn');
    return;
  }

  // Increment play count (fire-and-forget)
  fetch(`${BACKEND}/api/songs/${song.id}/play`, { method: 'POST' }).catch(() => {});
}

// ─── Audio element event listeners ───────────────────────────────────────────
audio.addEventListener('play',  () => setUI(true));
audio.addEventListener('pause', () => setUI(false));
audio.addEventListener('ended', () => {
  setUI(false);
  skipCount = 0;
  isRepeat ? audio.play() : nextSong();
});
audio.addEventListener('error', (e) => {
  if (!audio.currentSrc) return;
  console.error('Audio error:', audio.error?.message || e);
  setUI(false);
  showLoading(false);
  showToast('Audio could not load. Pick another song or press next.');
});
audio.addEventListener('timeupdate', () => {
  if (!audio.duration || isNaN(audio.duration)) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  document.getElementById('progFill').style.width = pct + '%';
  document.getElementById('curTime').textContent  = fmt(Math.floor(audio.currentTime));
  document.getElementById('totTime').textContent  = fmt(Math.floor(audio.duration));
});
audio.addEventListener('waiting', () => showLoading(true));
audio.addEventListener('canplay', () => showLoading(false));

// ─── Progress bar seek ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const bar = document.getElementById('progBar');
  if (bar) {
    bar.addEventListener('click', e => {
      if (!audio.duration || isNaN(audio.duration)) {
        showToast('Wait for song to load first');
        return;
      }
      const rect = bar.getBoundingClientRect();
      audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    });
  }
  initQueue();
});

// ─── Playback controls ────────────────────────────────────────────────────────
function togglePlay() {
  if (isLoading) { showToast('⏳ Loading, please wait...'); return; }
  if (!audio.src || audio.src === window.location.href) {
    showToast('No song loaded — pick one from the queue');
    return;
  }
  if (audio.paused) {
    audio.play().catch(e => {
      console.warn('Play failed:', e.message);
      showToast('Click anywhere on the page first, then press play');
    });
  } else {
    audio.pause();
  }
}

function nextSong() {
  if (isLoading) return;
  const wasPlaying = isPlaying;
  curIdx = isShuffle
    ? Math.floor(Math.random() * queue.length)
    : (curIdx + 1) % queue.length;
  loadSong(curIdx, wasPlaying);
}

function prevSong() {
  if (isLoading) return;
  // If more than 3s in, restart current song
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  const wasPlaying = isPlaying;
  curIdx = (curIdx - 1 + queue.length) % queue.length;
  loadSong(curIdx, wasPlaying);
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  document.getElementById('shuffleBtn').classList.toggle('on', isShuffle);
  showToast(isShuffle ? '🔀 Shuffle ON' : '🔀 Shuffle OFF');
}

function toggleRepeat() {
  isRepeat = !isRepeat;
  document.getElementById('repeatBtn').classList.toggle('on', isRepeat);
  showToast(isRepeat ? '🔁 Repeat ON' : '🔁 Repeat OFF');
}

function setVol(v) {
  audio.volume = Math.max(0, Math.min(1, parseFloat(v)));
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
function setUI(playing) {
  isPlaying = playing;
  const btn = document.getElementById('playBtn');
  if (btn) btn.textContent = playing ? '⏸' : '▶';
  document.getElementById('albumArt')?.classList.toggle('spin', playing);
  document.getElementById('viz')?.classList.toggle('on', playing);
}

function showLoading(show) {
  document.getElementById('loadOverlay')?.classList.toggle('hide', !show);
}

function setAlbumArt(url) {
  const art = document.getElementById('albumArt');
  if (!art) return;
  if (!url) {
    art.src = 'https://placehold.co/280x280/0f0f1e/7c3aed?text=🎵';
    return;
  }
  art.src = url;
  art.onerror = () => {
    art.src = 'https://placehold.co/280x280/0f0f1e/7c3aed?text=🎵';
    art.onerror = null;
  };
}

function renderQueue() {
  const el = document.getElementById('queueList');
  if (!el) return;
  el.innerHTML = '';
  queue.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'queue-item' + (i === curIdx ? ' active' : '');
    const thumb = s.thumbnailUrl
      || (s.youtubeId ? `https://img.youtube.com/vi/${s.youtubeId}/default.jpg` : '');
    div.innerHTML = `
      <img src="${thumb}" alt=""
           onerror="this.src='https://placehold.co/42x42/0f0f1e/7c3aed?text=🎵'">
      <div style="overflow:hidden;flex:1;">
        <div class="qi-title">${s.title}</div>
        <div class="qi-artist">${s.artist}</div>
      </div>
      <div class="qi-dur">${fmt(s.duration)}</div>`;
    div.addEventListener('click', () => { skipCount = 0; loadSong(i, true); });
    el.appendChild(div);
  });
}

// ─── Init queue on page load ─────────────────────────────────────────────────
async function initQueue() {
  if (localStorage.getItem('moodtunes_queue_version') !== QUEUE_VERSION) {
    localStorage.removeItem('moodtunes_queue');
    localStorage.removeItem('moodtunes_current_song');
    localStorage.removeItem('moodtunes_lyrics');
    localStorage.removeItem('moodtunes_lyrics_song');
    localStorage.setItem('moodtunes_queue_version', QUEUE_VERSION);
  }

  const stored = localStorage.getItem('moodtunes_queue');
  const cur    = localStorage.getItem('moodtunes_current_song');

  queue = stored ? JSON.parse(stored) : [];
  if (!queue.length && cur) queue = [JSON.parse(cur)];
  if (!queue.length) { await loadTrending(); return; }

  if (cur) {
    const c = JSON.parse(cur);
    const i = queue.findIndex(s => s.id === c.id);
    curIdx = i >= 0 ? i : 0;
  }
  renderQueue();
  loadSong(curIdx, false);
}

async function loadTrending() {
  try {
    const res = await fetch(`${BACKEND}/api/songs/trending`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data?.length) {
      document.getElementById('songTitle').textContent  = '⚠️ No songs in DB';
      document.getElementById('songArtist').textContent = 'Run data.sql in MySQL Workbench';
      showLoading(false);
      return;
    }
    queue = data; curIdx = 0;
    localStorage.setItem('moodtunes_queue', JSON.stringify(queue));
    renderQueue();
    loadSong(0, false);
  } catch(e) {
    showLoading(false); isLoading = false;
    document.getElementById('songTitle').textContent  = '⚠️ Backend not running';
    document.getElementById('songArtist').textContent = 'Run: .\\mvnw.cmd spring-boot:run (port 8082)';
  }
}

// ─── Lyrics ──────────────────────────────────────────────────────────────────
const INSTR_ARTISTS  = ['ludovico einaudi','hans zimmer','yiruma','marconi union','lofi girl','chillhop','erik satie','yann tiersen','joe hisaishi'];
const INSTR_KEYWORDS = ['instrumental','lofi','lo-fi','theme','symphony','concerto','ost','soundtrack','beats'];

async function fetchLyrics(artist, title) {
  const box = document.getElementById('lyricsBox');
  if (!box) return;
  const requestId = ++lyricsRequestId;
  localStorage.removeItem('moodtunes_lyrics');
  localStorage.removeItem('moodtunes_lyrics_song');
  box.innerHTML = '<div class="lyrics-empty"><div>⏳</div><p>Fetching lyrics...</p></div>';

  const isInstrumental =
    INSTR_ARTISTS.some(a => artist.toLowerCase().includes(a)) ||
    INSTR_KEYWORDS.some(k => title.toLowerCase().includes(k));

  if (isInstrumental) {
    if (requestId !== lyricsRequestId) return;
    box.innerHTML = `<div class="lyrics-empty">
      <div style="font-size:2.5rem">🎹</div>
      <p style="color:#a78bfa;font-weight:700;">Instrumental Track</p>
      <p style="font-size:.8rem;margin-top:.5rem;">No lyrics</p>
    </div>`;
    return;
  }

  try {
    const res = await fetch(
      `${BACKEND}/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`,
      { signal: AbortSignal.timeout(15000) }
    );
    if (requestId !== lyricsRequestId) return;
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const raw  = (data.lyrics || '').trim();

    if (!raw || raw.length < 20 || raw.toLowerCase().includes('not available')) {
      if (requestId !== lyricsRequestId) return;
      box.innerHTML = `<div class="lyrics-empty">
        <div>😔</div><p>Lyrics not found.</p>
        <a href="https://genius.com/search?q=${encodeURIComponent(artist + ' ' + title)}"
           target="_blank" style="color:#7c3aed;font-size:.8rem;display:block;margin-top:.5rem;">
          Search on Genius →
        </a>
      </div>`;
      return;
    }

    const pre = document.createElement('div');
    pre.className = 'lyrics-txt';
    pre.textContent = raw;
    if (requestId !== lyricsRequestId) return;
    box.innerHTML = '';
    box.appendChild(pre);
    localStorage.setItem('moodtunes_lyrics', raw);
    localStorage.setItem('moodtunes_lyrics_song', JSON.stringify({ artist, title }));

  } catch(e) {
    if (requestId !== lyricsRequestId) return;
    box.innerHTML = '<div class="lyrics-empty"><div>⚠️</div><p>Could not fetch lyrics.</p></div>';
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 3500);
}

function openOverlay() {
  window.open('overlay.html', 'lyrics', 'width=380,height=600,resizable=yes,toolbar=no,menubar=no');
}

function goAddPlaylist() {
  const s = queue[curIdx];
  if (s) localStorage.setItem('moodtunes_add_song', JSON.stringify(s));
  window.location.href = 'playlists.html';
}

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space')       { e.preventDefault(); togglePlay(); }
  if (e.code === 'ArrowRight')  { e.preventDefault(); nextSong(); }
  if (e.code === 'ArrowLeft')   { e.preventDefault(); prevSong(); }
  if (e.code === 'ArrowUp')     { const v = document.getElementById('volSlider'); v.value = Math.min(1, +v.value + 0.1); setVol(v.value); }
  if (e.code === 'ArrowDown')   { const v = document.getElementById('volSlider'); v.value = Math.max(0, +v.value - 0.1); setVol(v.value); }
});
