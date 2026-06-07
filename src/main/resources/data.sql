-- MoodTunes seed catalogue
-- Hindi/Bollywood-first songs are used because the player streams through JioSaavn.

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM playlist_songs;
DELETE FROM songs;
SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE songs AUTO_INCREMENT = 1;

INSERT INTO songs (title, artist, album, youtube_id, mood, genre, duration, play_count) VALUES

-- HAPPY
('Kala Chashma', 'Amar Arshi, Badshah, Neha Kakkar', 'Baar Baar Dekho', 'k4yXQkG2s1E', 'HAPPY', 'bollywood-happy', 187, 90),
('Badtameez Dil', 'Benny Dayal, Shefali Alvares', 'Yeh Jawaani Hai Deewani', 'II2EO3Nw4m0', 'HAPPY', 'bollywood-happy', 251, 86),
('London Thumakda', 'Labh Janjua, Sonu Kakkar, Neha Kakkar', 'Queen', 'udra3Mfw2oo', 'HAPPY', 'bollywood-happy', 230, 82),
('Gallan Goodiyaan', 'Yashita Sharma, Manish Kumar Tipu, Farhan Akhtar', 'Dil Dhadakne Do', 'jCEdTq3j-0U', 'HAPPY', 'bollywood-happy', 296, 78),
('Kar Gayi Chull', 'Badshah, Amaal Mallik, Fazilpuria, Neha Kakkar', 'Kapoor & Sons', 'NTHz9ephYTw', 'HAPPY', 'bollywood-happy', 187, 74),
('Nashe Si Chadh Gayi', 'Arijit Singh, Caralisa Monteiro', 'Befikre', 'Wd2B8OAotU8', 'HAPPY', 'bollywood-happy', 237, 70),

-- SAD
('Tum Hi Ho', 'Arijit Singh', 'Aashiqui 2', 'Umqb9KENgmk', 'SAD', 'bollywood-sad', 262, 72),
('Channa Mereya', 'Arijit Singh', 'Ae Dil Hai Mushkil', '284Ov7ysmfA', 'SAD', 'bollywood-sad', 289, 69),
('Agar Tum Saath Ho', 'Alka Yagnik, Arijit Singh', 'Tamasha', 'sK7riqg2mr4', 'SAD', 'bollywood-sad', 341, 66),
('Tujhe Kitna Chahne Lage', 'Arijit Singh', 'Kabir Singh', 'AgX2II9si7w', 'SAD', 'bollywood-sad', 277, 63),
('Phir Bhi Tumko Chaahunga', 'Arijit Singh, Shashaa Tirupati', 'Half Girlfriend', 'Al5LTRvDFKk', 'SAD', 'bollywood-sad', 272, 61),
('Hamari Adhuri Kahani', 'Arijit Singh', 'Hamari Adhuri Kahani', 'zE7Pwgl6sLA', 'SAD', 'bollywood-sad', 398, 58),

-- ENERGETIC
('Malhari', 'Vishal Dadlani', 'Bajirao Mastani', 'l_MyUGq7pgs', 'ENERGETIC', 'bollywood-energy', 245, 65),
('Sultan', 'Sukhwinder Singh, Shadab Faridi', 'Sultan', 'wPxqcq6Byq0', 'ENERGETIC', 'bollywood-energy', 281, 62),
('Apna Time Aayega', 'Ranveer Singh, Dub Sharma', 'Gully Boy', 'jFGKJBPFdUA', 'ENERGETIC', 'bollywood-rap', 140, 60),
('Sher Aaya Sher', 'DIVINE, Major C', 'Gully Boy', 'iQ4kq_0Drvk', 'ENERGETIC', 'bollywood-rap', 165, 56),
('Zinda', 'Siddharth Mahadevan', 'Bhaag Milkha Bhaag', 'Ax0G_P2dSBw', 'ENERGETIC', 'bollywood-energy', 228, 53),
('Jai Jai Shivshankar', 'Vishal Dadlani, Benny Dayal', 'War', 'Y4m_4ad6V0A', 'ENERGETIC', 'bollywood-dance', 230, 50),

-- CALM
('Ilahi', 'Arijit Singh', 'Yeh Jawaani Hai Deewani', 'fdubeMFwuGs', 'CALM', 'bollywood-calm', 229, 55),
('Safarnama', 'Lucky Ali', 'Tamasha', 'pX7jW1u8GGE', 'CALM', 'bollywood-calm', 274, 52),
('Kun Faya Kun', 'A.R. Rahman, Javed Ali, Mohit Chauhan', 'Rockstar', 'T94PHkuydcw', 'CALM', 'sufi', 470, 50),
('Iktara', 'Amit Trivedi, Kavita Seth', 'Wake Up Sid', 'fSS_R91Nimw', 'CALM', 'bollywood-calm', 253, 48),
('Khaabon Ke Parinday', 'Alyssa Mendonsa, Mohit Chauhan', 'Zindagi Na Milegi Dobara', 'R0XjwtP_iTY', 'CALM', 'bollywood-calm', 292, 45),
('Shaam', 'Amit Trivedi, Nikhil Dsouza, Neuman Pinto', 'Aisha', 'O9VukKo3C8A', 'CALM', 'bollywood-calm', 267, 42),

-- ROMANTIC
('Kesariya', 'Arijit Singh', 'Brahmastra', 'BddP6PYo2gs', 'ROMANTIC', 'bollywood-romantic', 268, 88),
('Raabta', 'Arijit Singh', 'Agent Vinod', 'zlt38OOqwDc', 'ROMANTIC', 'bollywood-romantic', 244, 76),
('Gerua', 'Arijit Singh, Antara Mitra', 'Dilwale', 'AEIVhBS6baE', 'ROMANTIC', 'bollywood-romantic', 346, 73),
('Pee Loon', 'Mohit Chauhan', 'Once Upon A Time In Mumbaai', 'V8dS1Iu0J2Y', 'ROMANTIC', 'bollywood-romantic', 285, 70),
('Jeena Jeena', 'Atif Aslam', 'Badlapur', '5g6Q3B6P4p8', 'ROMANTIC', 'bollywood-romantic', 248, 67),
('Tera Ban Jaunga', 'Akhil Sachdeva, Tulsi Kumar', 'Kabir Singh', 'ixbSJK-RWqE', 'ROMANTIC', 'bollywood-romantic', 244, 64),

-- ANGRY
('Aarambh Hai Prachand', 'Piyush Mishra', 'Gulaal', 'N_4C5Z8XJdE', 'ANGRY', 'bollywood-rock', 287, 46),
('Bhaag DK Bose', 'Ram Sampath', 'Delhi Belly', 'XQetm9YwX6A', 'ANGRY', 'bollywood-rock', 246, 44),
('Sadda Haq', 'Mohit Chauhan', 'Rockstar', 'p9DQINKZxWE', 'ANGRY', 'bollywood-rock', 348, 42),
('Khoon Chala', 'A.R. Rahman, Mohit Chauhan', 'Rang De Basanti', 'y1Q4H3l1Dqk', 'ANGRY', 'bollywood-rock', 189, 39),
('Brothers Anthem', 'Vishal Dadlani', 'Brothers', 'mxw6s7VjKuw', 'ANGRY', 'bollywood-energy', 321, 37),

-- FOCUS
('Aashiyan', 'Nikhil Paul George, Shreya Ghoshal', 'Barfi', 'Q9L4YP84Xdg', 'FOCUS', 'bollywood-focus', 230, 43),
('Phir Se Ud Chala', 'Mohit Chauhan', 'Rockstar', '2mWaqsC3U7k', 'FOCUS', 'bollywood-focus', 269, 41),
('Yun Hi Chala Chal', 'Udit Narayan, Hariharan, Kailash Kher', 'Swades', 'eEeX2QMlSlo', 'FOCUS', 'bollywood-focus', 416, 39),
('Lakshya', 'Shankar Mahadevan', 'Lakshya', '8DMF0U6xV78', 'FOCUS', 'bollywood-focus', 356, 36),
('Patang Dor', 'Amit Trivedi, Tochi Raina', 'Kai Po Che', 'k3gZUBuC1HE', 'FOCUS', 'bollywood-focus', 220, 33);
