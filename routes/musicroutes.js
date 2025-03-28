const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Music = require('../models/Music');

// Add or remove a song from favorites
router.post('/favorite/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user.userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.favorites.includes(id)) {
            user.favorites = user.favorites.filter(favId => favId.toString() !== id);
        } else {
            user.favorites.push(id);
        }

        await user.save();
        res.json({ message: 'Favorites updated', favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get favorite songs
router.get('/favorites', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('favorites');

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user.favorites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get recommended songs based on genre and likes
router.get('/recommendations', authenticateUser, async (req, res) => {
    try {
        const user = req.user;
        const likedSongs = await Music.find({ likes: user.userId });

        if (!likedSongs.length) {
            return res.json({ message: "Like songs to get recommendations!" });
        }

        const genres = [...new Set(likedSongs.map(song => song.genre))];
        const recommendedSongs = await Music.find({ genre: { $in: genres }, _id: { $nin: likedSongs.map(song => song._id) } });

        res.json(recommendedSongs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
