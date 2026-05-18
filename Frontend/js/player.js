// ═══════════════════════════════════════════════════════
//  MoodTunes — player.js  (v3 — Embedding Fix)
// ═══════════════════════════════════════════════════════

const API_BASE = 'http://localhost:8080/api';

// ── State ─────────────────────────────────────────────
let ytPlayer   = null;
let ytReady    = false;
let queue      = [];
let curIdx     = 0;
let isPlaying  = false;
let isShuffle  = false;
let isRepeat   = false;
let progTimer  = null;
const triedIds = {};   // tracks failed videoIds per song

// ── YouTube API Ready ─────────────────────────────────
function onYouTubeIframeAPIReady() {
  console.log('✅ YouTube IFrame API loaded');
  ytPlayer = new YT.Player('yt', {
    width: '480', height: '270',
    videoId: '',
    playerVars: {
      autoplay: 1, controls: 0, disablekb: 1,
      fs: 0, iv_load_policy: 3, modestbranding: 1,
      rel: 0, enablejsapi: 1, playsinline: 1,
      origin: window.location.origin
    },
    events: {
      onReady:       onPlayerReady,
      onStateChange: onStateChange,
      onError:       onError
    }
  });
}

function onPlayerReady(e) {
  ytReady = true;
  e.target.setVolume(80);
  e.target.unMute();
  console.log('✅ Player object ready');
  initQueue();
}

function onStateChange(e) {
  const S = YT.PlayerState;
  if (e.data === S.PLAYING)   { setUI(true);  startProg(); }
  if (e.data === S.PAUSED)    { setUI(false); stopProg();  }
  if (e.data === S.BUFFERING) { document.getElementById('playBtn').textContent = '⏳'; }
  if (e.data === S.ENDED) {
    stopProg();
    isRepeat ? (ytPlayer.seekTo(0), ytPlayer.playVideo()) : nextSong();
  }
}

// ── THE MAIN FIX: Auto-find alternative when embed fails ─
async function onError(e) {
  console.warn('YouTube error code:', e.data);
  const song = queue[curIdx];
  if (!song) return;

  if (e.data === 101 || e.data === 150 || e.data === 100) {
    showErr(`"${song.title}" blocked — finding alternative...`);
    const altId = await findAltVideo(song.title, song.artist, song.id);
    if (altId) {
      console.log('✅ Alt video found:', altId);
      ytPlayer.loadVideoById(altId);
    } else {
      showErr('No alternative found — skipping');
      setTimeout(() => nextSong(), 1500);
    }
  } else {
    showErr('Playback error — skipping...');
    setTimeout(() => nextSong(), 1500);
  }
}

async function findAltVideo(title, artist, songId) {
  if (!triedIds[songId]) triedIds[songId] = [queue[curIdx]?.youtubeId];

  // Try YouTube Data API if key is set
  const key = typeof YT_API_KEY !== 'undefined' ? YT_API_KEY : '';
  if (key && key !== 'YOUR_YOUTUBE_API_KEY') {
    try {
      const q   = encodeURIComponent(`${title} ${artist} official audio`);
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&videoEmbeddable=true&key=${key}&maxResults=5`;
      const res = await fetch(url);
      const dat = await res.json();
      if (dat.items) {
        for (const item of dat.items) {
          const vid = item.id.videoId;
          if (!triedIds[songId].includes(vid)) {
            triedIds[songId].push(vid);
            return vid;
          }
        }
      }
    } catch (err) { console.warn('API search failed', err); }
  }

  // Hardcoded fallbacks for popular songs
  const FALLBACKS = {
    'tum hi ho':                  ['Umqb9KENgmk','xKMNNFRBJBo','3EAjFNpZkME'],
    'channa mereya':              ['K4ex0DGNbgQ','_Mfq6jfEqis','RXzYAzFfEo0'],
    'kal ho na ho':               ['TTqRHGpTRqI','I0m-xLQbRDA'],
    'ae dil hai mushkil':         ['DfEvE49JVQE','wJqVGYtxFT0','l9BkHRi6FKE'],
    'badtameez dil':              ['zvdC5OaLMkM','rdGOm3GS2DE'],
    'gallan goodiyaan':           ['EhBgMoYY7ss','i3MNTGN6qkU'],
    'kar gayi chull':             ['eXpETuFbSYE','tP_7w9mBs1s'],
    'raabta':                     ['JHQNqbAykgQ','OhHsKt9RHZU'],
    'khairiyat':                  ['oAXGbFpxaBg','sDGSmQNfQoI'],
    'tera ban jaunga':            ['fKy-3JVkIaA','_bpxBPuGIxE'],
    'phir bhi tumko chaahunga':   ['jF88aNGcQBo','b_lIpE5d3Ys'],
    'someone like you':           ['_CDrEDfpBX8','L4tB3prVZWQ'],
    'fix you':                    ['JbcgVFmTq_w','AyGSGMj5Suw'],
    'killing in the name':        ['eoclFPSQfGY','7CVMFQ-IuS0'],
    'let her go':                 ['SFOtgMclb1Y','p5_PFBKElgA'],
    'blinding lights':            ['fHI8X4OXluQ','TUVcZfQe-Kw'],
    'lose yourself':              ['Eg_-bEuyCko','_Yhyp-_hX2s'],
    'shape of you':               ['JGwWNGJdvx8','agBz3mSir5k'],
  };

  const searchKey = Object.keys(FALLBACKS).find(k =>
    title.toLowerCase().includes(k));

  if (searchKey) {
    const unused = FALLBACKS[searchKey].filter(id => !triedIds[songId].includes(id));
    if (unused.length) { triedIds[songId].push(unused[0]); return unused[0]; }
  }

  return null;
}

// ── Init Queue ────────────────────────────────────────
function initQueue() {
  const stored = localStorage.getItem('moodtunes_queue');
  const cur    = localStorage.getItem('moodtunes_current_song');
  queue = stored ? JSON.parse(stored) : [];
  if (!queue.length && cur) queue = [JSON.parse(cur)];
  if (!queue.length) { loadTrending(); return; }
  if (cur) {
    const c = JSON.parse(cur);
    const i = queue.findIndex(s => s.id === c.id);
    curIdx = i >= 0 ? i : 0;
  }
  renderQueue();
  loadSong(curIdx, true);
}

async function loadTrending() {
  try {
    const res = await fetch(`${API_BASE}/songs/trending`);
    queue = await res.json();
    curIdx = 0;
    renderQueue();
    loadSong(0, false);
  } catch { showErr('Could not load songs — is Spring Boot running?'); }
}

// ── Load Song ─────────────────────────────────────────
function loadSong(idx, autoplay = true) {
  if (!queue.length) return;
  curIdx = Math.max(0, Math.min(idx, queue.length - 1));
  const song = queue[curIdx];

  document.getElementById('songTitle').textContent  = song.title;
  document.getElementById('songArtist').textContent = song.artist;

  const art = document.getElementById('albumArt');
  art.src = `https://img.youtube.com/vi/${song.youtubeId}/maxresdefault.jpg`;
  art.onerror = () => {
    art.src = `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`;
    art.onerror = null;
  };

  const meta = MOOD_META[song.mood] || MOOD_META.HAPPY;
  document.getElementById('moodBadge').innerHTML =
    `<span class="mbadge" style="background:${meta.color}22;color:${meta.color};
      border:1px solid ${meta.color}44;">${meta.emoji} ${song.mood}</span>`;

  document.getElementById('totTime').textContent  = fmt(song.duration || 0);
  document.getElementById('progFill').style.width = '0%';
  document.getElementById('curTime').textContent  = '0:00';

  renderQueue();
  localStorage.setItem('moodtunes_current_song', JSON.stringify(song));

  if (ytReady && ytPlayer && song.youtubeId) {
    autoplay
      ? ytPlayer.loadVideoById(song.youtubeId)
      : ytPlayer.cueVideoById(song.youtubeId);
  }

  fetchLyrics(song.artist, song.title);
  if (song.id) fetch(`${API_BASE}/songs/${song.id}/play`, { method: 'POST' }).catch(() => {});
}

// ── Controls ──────────────────────────────────────────
function togglePlay() {
  if (!ytReady) { showErr('Player loading...'); return; }
  const s = ytPlayer.getPlayerState();
  if (s === YT.PlayerState.PLAYING) ytPlayer.pauseVideo();
  else ytPlayer.playVideo();
}

function nextSong() {
  curIdx = isShuffle
    ? Math.floor(Math.random() * queue.length)
    : (curIdx + 1) % queue.length;
  loadSong(curIdx, true);
}

function prevSong() {
  if (ytReady && ytPlayer.getCurrentTime && ytPlayer.getCurrentTime() > 3) {
    ytPlayer.seekTo(0); return;
  }
  curIdx = (curIdx - 1 + queue.length) % queue.length;
  loadSong(curIdx, true);
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
function setVol(v) { if (ytReady) ytPlayer.setVolume(parseInt(v)); }

// ── Progress ──────────────────────────────────────────
function startProg() {
  stopProg();
  progTimer = setInterval(() => {
    if (!ytReady || !ytPlayer.getCurrentTime) return;
    const cur = ytPlayer.getCurrentTime() || 0;
    const dur = ytPlayer.getDuration()    || 1;
    document.getElementById('progFill').style.width = `${(cur/dur)*100}%`;
    document.getElementById('curTime').textContent  = fmt(Math.floor(cur));
    document.getElementById('totTime').textContent  = fmt(Math.floor(dur));
  }, 500);
}
function stopProg() { if (progTimer) clearInterval(progTimer); }

document.addEventListener('DOMContentLoaded', () => {
  const bar = document.getElementById('progBar');
  if (bar) {
    bar.addEventListener('click', e => {
      if (!ytReady) return;
      const r = e.clientX - bar.getBoundingClientRect().left;
      ytPlayer.seekTo((r / bar.offsetWidth) * ytPlayer.getDuration(), true);
    });
  }
});

// ── UI ────────────────────────────────────────────────
function setUI(playing) {
  isPlaying = playing;
  document.getElementById('playBtn').textContent = playing ? '⏸' : '▶';
  document.getElementById('albumArt').classList.toggle('spinning', playing);
  document.getElementById('viz').classList.toggle('on', playing);
}

function renderQueue() {
  const el = document.getElementById('queueList');
  if (!el) return;
  el.innerHTML = '';
  queue.forEach((song, i) => {
    const div = document.createElement('div');
    div.className = 'queue-item' + (i === curIdx ? ' active' : '');
    div.innerHTML = `
      <img src="https://img.youtube.com/vi/${song.youtubeId}/default.jpg" alt=""
           onerror="this.src='https://via.placeholder.com/42x42/0f0f1e/7c3aed?text=🎵'">
      <div style="overflow:hidden;flex:1;">
        <div class="qi-title">${song.title}</div>
        <div class="qi-artist">${song.artist}</div>
      </div>
      <div class="qi-dur">${fmt(song.duration)}</div>`;
    div.addEventListener('click', () => loadSong(i, true));
    el.appendChild(div);
  });
}

// ── Lyrics ────────────────────────────────────────────
const INSTR_ARTISTS  = ['ludovico einaudi','claude debussy','hans zimmer','yiruma',
  'marconi union','chillhop','lofi girl','chillcow','erik satie','yann tiersen'];
const INSTR_KEYWORDS = ['instrumental','lofi','lo-fi','theme','symphony','sonata',
  'concerto','ost','soundtrack','radio','beats'];

async function fetchLyrics(artist, title) {
  const box = document.getElementById('lyricsBox');
  if (!box) return;
  box.innerHTML = '<div class="lyrics-empty"><div>⏳</div><p>Fetching lyrics...</p></div>';

  const aLow = artist.toLowerCase(), tLow = title.toLowerCase();
  if (INSTR_ARTISTS.some(a => aLow.includes(a)) || INSTR_KEYWORDS.some(k => tLow.includes(k))) {
    box.innerHTML = `<div class="lyrics-empty">
      <div style="font-size:2.5rem">🎹</div>
      <p style="color:#a78bfa;font-weight:700;">Instrumental Track</p>
      <p style="font-size:.8rem;margin-top:.5rem;">No lyrics — enjoy the music 🎵</p>
    </div>`;
    localStorage.setItem('moodtunes_lyrics', '🎹 Instrumental');
    return;
  }

  try {
    const res  = await fetch(`${API_BASE}/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
    const data = await res.json();
    const raw  = data.lyrics || '';

    if (!raw || raw.length < 30 || raw.toLowerCase().includes('not available')) {
      box.innerHTML = `<div class="lyrics-empty">
        <div style="font-size:2rem">😔</div><p>Lyrics not found.</p>
        <a href="https://genius.com/search?q=${encodeURIComponent(artist+' '+title)}"
           target="_blank" style="color:#7c3aed;font-size:.8rem;margin-top:.5rem;display:block;">
          Search on Genius →</a></div>`;
      return;
    }

    const pre = document.createElement('div');
    pre.className = 'lyrics-txt';
    pre.textContent = raw;
    box.innerHTML = '';
    box.appendChild(pre);
    localStorage.setItem('moodtunes_lyrics', raw);
    localStorage.setItem('moodtunes_lyrics_song', JSON.stringify({ artist, title }));
  } catch {
    box.innerHTML = '<div class="lyrics-empty"><div>⚠️</div><p>Could not fetch lyrics.</p></div>';
  }
}

// ── Overlay / Playlist ────────────────────────────────
function openOverlay() {
  window.open('overlay.html','lyrics','width=380,height=600,resizable=yes,toolbar=no,menubar=no');
}
function goAddPlaylist() {
  const s = queue[curIdx];
  if (s) localStorage.setItem('moodtunes_add_song', JSON.stringify(s));
  window.location.href = 'playlists.html';
}

// ── Helpers ───────────────────────────────────────────
function fmt(s) {
  if (!s) return '0:00';
  return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
}
function showErr(msg) {
  const b = document.getElementById('errBox');
  if (!b) return;
  b.textContent = '⚠️ ' + msg;
  b.style.display = 'block';
  setTimeout(() => b.style.display = 'none', 4000);
}

// ── Keyboard shortcuts ────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space')      { e.preventDefault(); togglePlay(); }
  if (e.code === 'ArrowRight') { e.preventDefault(); nextSong(); }
  if (e.code === 'ArrowLeft')  { e.preventDefault(); prevSong(); }
  if (e.code === 'ArrowUp') {
    const v = document.getElementById('volSlider');
    v.value = Math.min(100, +v.value + 10); setVol(v.value);
  }
  if (e.code === 'ArrowDown') {
    const v = document.getElementById('volSlider');
    v.value = Math.max(0, +v.value - 10); setVol(v.value);
  }
});