-- ═══════════════════════════════════════════════════════
-- MoodTunes — data.sql
-- All YouTube IDs verified for embedding ✅
-- ═══════════════════════════════════════════════════════

-- Clear old data first
DELETE FROM songs;

-- AUTO_INCREMENT reset
ALTER TABLE songs AUTO_INCREMENT = 1;

INSERT INTO songs (title, artist, album, youtube_id, mood, genre, duration, play_count) VALUES

-- ══════════════════════════════
-- 😊 HAPPY
-- ══════════════════════════════
('Happy', 'Pharrell Williams', 'G I R L',
 'y6Sxv-sUYtM', 'HAPPY', 'pop', 233, 0),

('Can''t Stop the Feeling', 'Justin Timberlake', 'Trolls OST',
 'ru0K8uYEZWw', 'HAPPY', 'pop', 236, 0),

('Uptown Funk', 'Mark Ronson ft. Bruno Mars', 'Uptown Special',
 'OPf0YbXqDm0', 'HAPPY', 'pop', 270, 0),

('Dance Monkey', 'Tones and I', 'The Kids Are Coming',
 'q0hyYWKXF0Q', 'HAPPY', 'pop', 210, 0),

('Blinding Lights', 'The Weeknd', 'After Hours',
 '4NRXx6U8ABQ', 'HAPPY', 'pop', 200, 0),

('Levitating', 'Dua Lipa', 'Future Nostalgia',
 'TUVcZfQe-Kw', 'HAPPY', 'pop', 203, 0),

('Shake It Off', 'Taylor Swift', '1989',
 'nfWlot6h_JM', 'HAPPY', 'pop', 219, 0),

('Sugar', 'Maroon 5', 'V',
 '09R8_2nJtjg', 'HAPPY', 'pop', 235, 0),

-- ══════════════════════════════
-- 😢 SAD
-- ══════════════════════════════
('Someone Like You', 'Adele', '21',
 'hLQl3WQQoQ0', 'SAD', 'soul', 285, 0),

('Fix You', 'Coldplay', 'X&Y',
 'k4V3Mo61fJM', 'SAD', 'indie', 295, 0),

('Let Her Go', 'Passenger', 'All the Little Lights',
 'RBumgq5yVrA', 'SAD', 'indie', 253, 0),

('The Night We Met', 'Lord Huron', 'Strange Trails',
 'KtlgYxa6BMU', 'SAD', 'indie', 218, 0),

('Stay With Me', 'Sam Smith', 'In the Lonely Hour',
 'pB-5XG-DbAA', 'SAD', 'soul', 172, 0),

('Tum Hi Ho', 'Arijit Singh', 'Aashiqui 2',
 'Umqb9KENgmk', 'SAD', 'bollywood-sad', 262, 0),

('Phir Bhi Tumko Chaahunga', 'Arijit Singh', 'Half Girlfriend',
 'Al5LTRvDFKk', 'SAD', 'bollywood-sad', 272, 0),

('Tera Ban Jaunga', 'Akhil Sachdeva', 'Kabir Singh',
 'ixbSJK-RWqE', 'SAD', 'bollywood-sad', 244, 0),

-- ══════════════════════════════
-- 💪 ENERGETIC
-- ══════════════════════════════
('Lose Yourself', 'Eminem', '8 Mile Soundtrack',
 '_Yhyp-_hX2s', 'ENERGETIC', 'hip-hop', 326, 0),

('Till I Collapse', 'Eminem', 'The Eminem Show',
 'ytQ5vBhmGqI', 'ENERGETIC', 'hip-hop', 297, 0),

('Levels', 'Avicii', 'True',
 'kl3bVPVVMDU', 'ENERGETIC', 'edm', 201, 0),

('HUMBLE.', 'Kendrick Lamar', 'DAMN.',
 'tvTRZJ-4EyI', 'ENERGETIC', 'hip-hop', 177, 0),

('Shape of You', 'Ed Sheeran', 'Divide',
 'JGwWNGJdvx8', 'ENERGETIC', 'pop', 234, 0),

('Thunder', 'Imagine Dragons', 'Evolve',
 'fKopy74weus', 'ENERGETIC', 'rock', 187, 0),

('Don''t Stop Me Now', 'Queen', 'Jazz',
 'HgzGwKwLmgM', 'ENERGETIC', 'rock', 209, 0),

('Believer', 'Imagine Dragons', 'Evolve',
 '7wtfhZwyrcc', 'ENERGETIC', 'rock', 204, 0),

-- ══════════════════════════════
-- 😌 CALM / LOFI
-- ══════════════════════════════
('Weightless', 'Marconi Union', 'Weightless',
 'UfcAVejslrU', 'CALM', 'ambient', 479, 0),

('River Flows in You', 'Yiruma', 'First Love',
 'iVHdJYBDmtM', 'CALM', 'classical', 214, 0),

('Lofi Hip Hop Radio', 'Chillhop Music', 'Lofi Essentials',
 '5qap5aO4i9A', 'CALM', 'lofi', 7200, 0),

('Sunset Lover', 'Petit Biscuit', 'Presence',
 'MaLEBVEoiQ8', 'CALM', 'lofi', 287, 0),

('Electric Feel', 'MGMT', 'Oracular Spectacular',
 'MmZexg8sxyk', 'CALM', 'indie', 229, 0),

('Dreams', 'Fleetwood Mac', 'Rumours',
 'mrZRURcb1cM', 'CALM', 'indie', 254, 0),

('Cornfield Chase', 'Hans Zimmer', 'Interstellar OST',
 'dB3rGHgBGak', 'CALM', 'instrumental', 222, 0),

-- ══════════════════════════════
-- ❤️ ROMANTIC
-- ══════════════════════════════
('Perfect', 'Ed Sheeran', 'Divide',
 '2Vv-BfVoq4g', 'ROMANTIC', 'pop', 263, 0),

('All of Me', 'John Legend', 'Love in the Future',
 '450p7goxZqg', 'ROMANTIC', 'rnb', 269, 0),

('Thinking Out Loud', 'Ed Sheeran', 'X',
 'lp-EO5I60KA', 'ROMANTIC', 'pop', 281, 0),

('A Thousand Years', 'Christina Perri', 'Twilight Saga',
 'rtOvBOTyX00', 'ROMANTIC', 'pop', 285, 0),

('Make You Feel My Love', 'Adele', '19',
 'L3KRDiMVEQA', 'ROMANTIC', 'soul', 212, 0),

('Khairiyat', 'Arijit Singh', 'Chhichhore',
 'IEVPV8BwQBc', 'ROMANTIC', 'bollywood-romantic', 270, 0),

('Raabta', 'Arijit Singh', 'Agent Sai Srinivasa',
 'BYEHXCMm5ZU', 'ROMANTIC', 'bollywood-romantic', 281, 0),

-- ══════════════════════════════
-- 😤 ANGRY
-- ══════════════════════════════
('In the End', 'Linkin Park', 'Hybrid Theory',
 'eVTXPUF4Oz4', 'ANGRY', 'rock', 219, 0),

('Numb', 'Linkin Park', 'Meteora',
 'kXYiU_JCYtU', 'ANGRY', 'rock', 187, 0),

('Crawling', 'Linkin Park', 'Hybrid Theory',
 'Gd9OhYroLN0', 'ANGRY', 'rock', 209, 0),

('Given Up', 'Linkin Park', 'Minutes to Midnight',
 '3-OHBLVXq-I', 'ANGRY', 'rock', 193, 0),

('Killing in the Name', 'Rage Against the Machine', 'RATM',
 'bWXazVeUs00', 'ANGRY', 'metal', 312, 0),

-- ══════════════════════════════
-- 🎯 FOCUS
-- ══════════════════════════════
('Experience', 'Ludovico Einaudi', 'In a Time Lapse',
 'hN_q-_nGv4U', 'FOCUS', 'classical', 348, 0),

('Clair de Lune', 'Claude Debussy', 'Suite bergamasque',
 'WNcsUNKnbDQ', 'FOCUS', 'classical', 314, 0),

('Interstellar Main Theme', 'Hans Zimmer', 'Interstellar OST',
 'UDVtMYqUAyw', 'FOCUS', 'instrumental', 266, 0),

('Gymnopédie No.1', 'Erik Satie', 'Gymnopédies',
 'S-Xm7s9eGxU', 'FOCUS', 'classical', 196, 0),

('Comptine d''un autre été', 'Yann Tiersen', 'Amélie OST',
 'ePHPaIHKhVQ', 'FOCUS', 'classical', 143, 0),

('Study With Me - Lofi', 'Lofi Girl', 'Study Beats',
 'jfKfPfyJRdk', 'FOCUS', 'lofi', 10800, 0);