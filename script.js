document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const resultsContainer = document.getElementById("results");
    const playlistContainer = document.getElementById("playlist-container");
    const API_KEY = "YOUR_YOUTUBE_API_KEY"; // 🔴 Replace with your YouTube Data API v3 key

    // 🔍 Search YouTube for videos
    async function searchYouTube(query) {
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=10`
            );
            const data = await response.json();

            if (data.items) {
                displayResults(data.items);
            } else {
                resultsContainer.innerHTML = "<p>No results found.</p>";
            }
        } catch (error) {
            console.error("YouTube API Error:", error);
            resultsContainer.innerHTML = "<p>Error fetching data.</p>";
        }
    }

    // 🎥 Display search results
    function displayResults(videos) {
        resultsContainer.innerHTML = ""; // Clear previous results

        videos.forEach(video => {
            const videoElement = document.createElement("div");
            videoElement.classList.add("video-item");

            videoElement.innerHTML = `
                <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
                <h4>${video.snippet.title}</h4>
                <button class="add-to-playlist" data-video-id="${video.id.videoId}" data-title="${video.snippet.title}">
                    ➕ Add to Playlist
                </button>
            `;

            resultsContainer.appendChild(videoElement);
        });

        // Attach event listeners to "Add to Playlist" buttons
        document.querySelectorAll(".add-to-playlist").forEach(button => {
            button.addEventListener("click", event => {
                const videoId = event.target.getAttribute("data-video-id");
                const title = event.target.getAttribute("data-title");
                addToPlaylist(videoId, title);
            });
        });
    }

    // 🎼 Add video to playlist
    function addToPlaylist(videoId, title) {
        const playlistItem = document.createElement("li");
        playlistItem.innerHTML = `
            <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">${title}</a>
            <button class="remove-btn">❌</button>
        `;

        // Remove from playlist functionality
        playlistItem.querySelector(".remove-btn").addEventListener("click", () => {
            playlistItem.remove();
        });

        playlistContainer.appendChild(playlistItem);
    }

    // 🔍 Event listener for search button
    searchButton.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query !== "") {
            searchYouTube(query);
        }
    });

    // 🔎 Search on "Enter" key press
    searchInput.addEventListener("keypress", event => {
        if (event.key === "Enter") {
            searchButton.click();
        }
    });
});
const API_KEY = "YOUR_YOUTUBE_API_KEY"; // Replace with your API key
const PLAYLISTS_FILE = "playlists.json";

document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");
    const resultsContainer = document.getElementById("results");
    const playlistsContainer = document.getElementById("playlists-container");

    // Load playlists on page load
    fetchPlaylists();

    // Search Form Event Listener
    searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            searchYouTube(query);
        }
    });

    // Function to search YouTube videos
    async function searchYouTube(query) {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}&maxResults=10`;
        resultsContainer.innerHTML = "<p>Loading...</p>";

        try {
            const response = await fetch(url);
            const data = await response.json();
            displayResults(data.items);
        } catch (error) {
            resultsContainer.innerHTML = `<p>Error fetching results: ${error.message}</p>`;
        }
    }

    // Function to display search results
    function displayResults(videos) {
        resultsContainer.innerHTML = "";
        videos.forEach(video => {
            const videoElement = document.createElement("div");
            videoElement.classList.add("video-item");

            videoElement.innerHTML = `
                <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
                <h3>${video.snippet.title}</h3>
                <button onclick="playVideo('${video.id.videoId}')">Play</button>
                <button onclick="saveToPlaylist('${video.id.videoId}', '${video.snippet.title}')">Save</button>
            `;

            resultsContainer.appendChild(videoElement);
        });
    }

    // Function to play video
    window.playVideo = function (videoId) {
        const playerContainer = document.getElementById("player-container");
        playerContainer.innerHTML = `
            <iframe width="100%" height="400px" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
        `;
    };

    // Function to save video to a playlist
    window.saveToPlaylist = async function (videoId, title) {
        const playlistName = prompt("Enter playlist name:");
        if (!playlistName) return;

        // Fetch existing playlists
        let playlists = await fetchPlaylists();

        if (!playlists[playlistName]) {
            playlists[playlistName] = [];
        }

        playlists[playlistName].push({ videoId, title });

        // Save to local storage
        localStorage.setItem("playlists", JSON.stringify(playlists));
        alert(`Saved "${title}" to ${playlistName}`);
        displayPlaylists();
    };

    // Function to fetch playlists
    async function fetchPlaylists() {
        let playlists = JSON.parse(localStorage.getItem("playlists")) || {};
        displayPlaylists(playlists);
        return playlists;
    }

    // Function to display playlists
    function displayPlaylists(playlists = {}) {
        playlistsContainer.innerHTML = "<h2>Your Playlists</h2>";

        for (const [name, videos] of Object.entries(playlists)) {
            const playlistElement = document.createElement("div");
            playlistElement.classList.add("playlist");

            playlistElement.innerHTML = `<h3>${name}</h3>`;
            videos.forEach(video => {
                playlistElement.innerHTML += `<p>${video.title}</p>`;
            });

            playlistsContainer.appendChild(playlistElement);
        }
    }
});
document.addEventListener("DOMContentLoaded", async () => {
    // Fetch artist profile
    const artistName = document.getElementById("artist-name");
    const artistBio = document.getElementById("artist-bio");

    try {
        const res = await fetch("json/users.json");
        const users = await res.json();
        const artist = users[0]; // Assume first user is logged in
        artistName.textContent = artist.name;
        artistBio.textContent = artist.bio;
    } catch (error) {
        console.error("Error fetching artist:", error);
    }

    // Upload music
    const uploadBtn = document.getElementById("upload-music-btn");
    uploadBtn.addEventListener("click", async () => {
        const title = document.getElementById("music-title").value;
        const url = document.getElementById("music-url").value;

        if (!title || !url) {
            alert("Please enter a title and YouTube URL.");
            return;
        }

        const newSong = { title, url, artist: artistName.textContent };

        try {
            const res = await fetch("json/music.json");
            const musicList = await res.json();
            musicList.push(newSong);

            await fetch("json/music.json", {
                method: "POST",
                body: JSON.stringify(musicList),
            });

            location.reload();
        } catch (error) {
            console.error("Error uploading music:", error);
        }
    });

    // Load artist songs
    const musicList = document.getElementById("music-list");
    try {
        const res = await fetch("json/music.json");
        const musicData = await res.json();
        musicData.forEach((song, index) => {
            const li = document.createElement("li");
            li.innerHTML = `${song.title} - ${song.artist} <button class="delete-btn" data-id="${index}">X</button>`;
            musicList.appendChild(li);
        });

        // Delete song
        document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                const id = e.target.getAttribute("data-id");
                musicData.splice(id, 1);
                await fetch("json/music.json", {
                    method: "POST",
                    body: JSON.stringify(musicData),
                });
                location.reload();
            });
        });
    } catch (error) {
        console.error("Error loading music:", error);
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const songs = ["music/j.cole-the_fall_off_mp3_44235.mp3", "music/kendrick_lamar_heart_pt._6_official_audio_mp3_44205.mp3"];
    let currentSongIndex = 0;

    const audioPlayer = document.getElementById("audio-player");
    const audioSource = document.getElementById("audio-source");
    const playPauseButton = document.getElementById("play-pause");
    const prevButton = document.getElementById("prev-song");
    const nextButton = document.getElementById("next-song");

    function playSong(index) {
        audioSource.src = songs[index]; 
        audioPlayer.load(); 
        audioPlayer.play(); 
        playPauseButton.textContent = "⏸ Pause";
    }

    playPauseButton.addEventListener("click", () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseButton.textContent = "⏸ Pause";
        } else {
            audioPlayer.pause();
            playPauseButton.textContent = "▶ Play";
        }
    });

    prevButton.addEventListener("click", () => {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        playSong(currentSongIndex);
    });

    nextButton.addEventListener("click", () => {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        playSong(currentSongIndex);
    });

    audioPlayer.addEventListener("ended", () => {
        nextButton.click();
    });
});
