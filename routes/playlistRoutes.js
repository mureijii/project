const express = require('express');
const Playlist = require('../models/Playlist');
const { authenticateUser } = require('../middleware/authMiddleware');
const router = express.Router();

// Create a Playlist
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { name, description } = req.body;
        const newPlaylist = new Playlist({
            name,
            description,
            createdBy: req.user.userId
        });
        await newPlaylist.save();
        res.status(201).json(newPlaylist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Playlists
router.get('/', async (req, res) => {
    try {
        const playlists = await Playlist.find().populate('createdBy', 'name').populate('songs');
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add Songs to Playlist
router.put('/:id/add-song', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { songId } = req.body;
        const playlist = await Playlist.findById(id);
        
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
        if (playlist.createdBy.toString() !== req.user.userId && !playlist.collaborators.includes(req.user.userId)) {
            return res.status(403).json({ message: 'Unauthorized to modify this playlist' });
        }

        if (!playlist.songs.includes(songId)) {
            playlist.songs.push(songId);
            await playlist.save();
        }

        res.json({ message: 'Song added to playlist', playlist });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove Songs from Playlist
router.put('/:id/remove-song', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { songId } = req.body;
        const playlist = await Playlist.findById(id);
        
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
        if (playlist.createdBy.toString() !== req.user.userId && !playlist.collaborators.includes(req.user.userId)) {
            return res.status(403).json({ message: 'Unauthorized to modify this playlist' });
        }

        playlist.songs = playlist.songs.filter(song => song.toString() !== songId);
        await playlist.save();

        res.json({ message: 'Song removed from playlist', playlist });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a Playlist
router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const playlist = await Playlist.findById(id);

        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
        if (playlist.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this playlist' });
        }

        await Playlist.findByIdAndDelete(id);
        res.json({ message: 'Playlist deleted successfully' });
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
router.get('/search', authenticateUser, async (req, res) => {
    try {
        const { query } = req.query;

        const playlists = await Playlist.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { createdBy: { $regex: query, $options: 'i' } }
            ]
        }).populate("createdBy", "name");

        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const playlist = await Playlist.findById(id).populate("createdBy", "name").populate("songs");

        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

        res.json(playlist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
