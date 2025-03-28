const express = require("express");

const Playlist = require("../models/Playlist");
const { authenticateUser } = require("../middleware/authMiddleware");

// Get all playlists
router.get("/", authenticateUser, async (req, res) => {
    try {
        const playlists = await Playlist.find({ $or: [{ createdBy: req.user.userId }, { collaborators: req.user.userId }] });
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single playlist
router.get("/:id", authenticateUser, async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });
        res.json(playlist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new playlist
router.post("/", authenticateUser, async (req, res) => {
    try {
        const { name } = req.body;
        const newPlaylist = new Playlist({
            name,
            createdBy: req.user.userId,
            songs: [],
            collaborators: [],
        });
        await newPlaylist.save();
        res.status(201).json(newPlaylist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a song to a playlist
router.post("/:id/songs", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, url } = req.body;

        const playlist = await Playlist.findById(id);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });

        playlist.songs.push({ title, url });
        await playlist.save();
        res.json({ message: "Song added successfully", playlist });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reorder songs in a playlist
router.put("/:id/reorder", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { order } = req.body;

        const playlist = await Playlist.findById(id);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });

        playlist.songs = order.map(item => {
            return playlist.songs.find(song => song._id.toString() === item.id);
        });

        await playlist.save();
        res.json({ message: "Playlist order updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add collaborators to a playlist
router.put("/:id/collaborators", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { collaborators } = req.body;

        const playlist = await Playlist.findById(id);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });

        if (playlist.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Unauthorized to manage collaborators" });
        }

        playlist.collaborators = collaborators;
        await playlist.save();
        res.json({ message: "Collaborators updated successfully", playlist });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a playlist
router.delete("/:id", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;

        const playlist = await Playlist.findById(id);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });

        if (playlist.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Unauthorized to delete this playlist" });
        }

        await Playlist.findByIdAndDelete(id);
        res.json({ message: "Playlist deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id/reorder', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { oldIndex, newIndex } = req.body;
        const playlist = await Playlist.findById(id);

        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

        // Ensure the user is the owner or a collaborator
        if (playlist.createdBy.toString() !== req.user.userId && 
            !playlist.collaborators.includes(req.user.userId)) {
            return res.status(403).json({ message: 'Unauthorized to modify this playlist' });
        }

        // Reordering logic
        const [movedSong] = playlist.songs.splice(oldIndex, 1);
        playlist.songs.splice(newIndex, 0, movedSong);

        await playlist.save();
        res.json({ message: 'Playlist reordered successfully', playlist });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();
const playlistsFile = './playlists.json';

// Read JSON
const readJsonFile = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Get all playlists
router.get('/', (req, res) => {
    const playlists = readJsonFile(playlistsFile);
    res.json(playlists);
});

module.exports = router;


module.exports = router;
