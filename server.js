require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// JSON file paths
const usersFile = path.join(__dirname, 'users.json');
const playlistsFile = path.join(__dirname, 'playlists.json');
const musicFile = path.join(__dirname, 'music.json');

// Helper function to read JSON files
const readJsonFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
};

// Helper function to write JSON files
const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
    }
};

// Authentication Middleware
const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

// Routes
// 1️⃣ **User Authentication**
app.post('/api/auth/register', async (req, res) => {
    const { name, email, bio, password, authLevel } = req.body;
    let users = readJsonFile(usersFile);

    if (users.some(user => user.email === email)) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: users.length + 1,
        name,
        email,
        bio,
        passkey: hashedPassword,
        authLevel
    };

    users.push(newUser);
    writeJsonFile(usersFile, users);
    res.status(201).json({ message: "User registered successfully", user: newUser });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const users = readJsonFile(usersFile);

    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.passkey))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, authLevel: user.authLevel }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
});

// 2️⃣ **Music Routes**
app.get('/api/music', (req, res) => {
    const music = readJsonFile(musicFile);
    res.json(music);
});

app.post('/api/music/upload', authenticateUser, (req, res) => {
    if (req.user.authLevel !== 2) {
        return res.status(403).json({ message: "Only artists can upload music" });
    }

    let music = readJsonFile(musicFile);
    const { title, artist, url } = req.body;
    const newSong = { id: music.length + 1, title, artist, url, uploadedBy: req.user.userId };

    music.push(newSong);
    writeJsonFile(musicFile, music);
    res.status(201).json({ message: "Song uploaded successfully", song: newSong });
});

// 3️⃣ **Playlist Routes**
app.get('/api/playlists', (req, res) => {
    const playlists = readJsonFile(playlistsFile);
    res.json(playlists);
});

app.post('/api/playlists', authenticateUser, (req, res) => {
    let playlists = readJsonFile(playlistsFile);
    const { name } = req.body;

    const newPlaylist = {
        id: playlists.length + 1,
        name,
        createdBy: req.user.userId,
        collaborators: [],
        songs: []
    };

    playlists.push(newPlaylist);
    writeJsonFile(playlistsFile, playlists);
    res.status(201).json({ message: "Playlist created", playlist: newPlaylist });
});

app.put('/api/playlists/:id/collaborators', authenticateUser, (req, res) => {
    let playlists = readJsonFile(playlistsFile);
    const { id } = req.params;
    const { collaborators } = req.body;

    const playlist = playlists.find(p => p.id == id);
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    if (playlist.createdBy !== req.user.userId) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    playlist.collaborators = collaborators;
    writeJsonFile(playlistsFile, playlists);
    res.json({ message: "Collaborators updated", playlist });
});

app.put('/api/playlists/:id/add-song', authenticateUser, (req, res) => {
    let playlists = readJsonFile(playlistsFile);
    const { id } = req.params;
    const { songId } = req.body;

    const playlist = playlists.find(p => p.id == id);
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    if (playlist.createdBy !== req.user.userId && !playlist.collaborators.includes(req.user.userId)) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    if (!playlist.songs.includes(songId)) {
        playlist.songs.push(songId);
        writeJsonFile(playlistsFile, playlists);
    }

    res.json({ message: "Song added to playlist", playlist });
});

// 4️⃣ **Delete a Playlist**
app.delete('/api/playlists/:id', authenticateUser, (req, res) => {
    let playlists = readJsonFile(playlistsFile);
    const { id } = req.params;

    const playlist = playlists.find(p => p.id == id);
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    if (playlist.createdBy !== req.user.userId) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    playlists = playlists.filter(p => p.id != id);
    writeJsonFile(playlistsFile, playlists);
    res.json({ message: "Playlist deleted" });
});
app.post("/api/auth/artist-login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const artist = await User.findOne({ email, role: "artist" });

        if (!artist) {
            return res.status(401).json({ message: "Artist not found" });
        }

        const isMatch = await bcrypt.compare(password, artist.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: artist._id, role: "artist" }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Start Server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
