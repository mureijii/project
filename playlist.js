document.addEventListener("DOMContentLoaded", function () {
    const playlistsContainer = document.getElementById("playlists-container");

    // Load playlists from local storage
    function fetchPlaylists() {
        let playlists = JSON.parse(localStorage.getItem("playlists")) || {};
        displayPlaylists(playlists);
    }

    // Display playlists
    function displayPlaylists(playlists) {
        playlistsContainer.innerHTML = "";

        if (Object.keys(playlists).length === 0) {
            playlistsContainer.innerHTML = "<p>No playlists found.</p>";
            return;
        }

        for (const [name, videos] of Object.entries(playlists)) {
            const playlistElement = document.createElement("div");
            playlistElement.classList.add("playlist");

            playlistElement.innerHTML = `
                <h3>${name}</h3>
                <ul>
                    ${videos.map(video => `<li>${video.title} <button onclick="removeFromPlaylist('${name}', '${video.videoId}')">❌</button></li>`).join("")}
                </ul>
                <button onclick="deletePlaylist('${name}')">Delete Playlist</button>
            `;

            playlistsContainer.appendChild(playlistElement);
        }
    }

    // Remove a song from a playlist
    window.removeFromPlaylist = function (playlistName, videoId) {
        let playlists = JSON.parse(localStorage.getItem("playlists"));
        playlists[playlistName] = playlists[playlistName].filter(video => video.videoId !== videoId);

        if (playlists[playlistName].length === 0) {
            delete playlists[playlistName]; // Remove empty playlist
        }

        localStorage.setItem("playlists", JSON.stringify(playlists));
        fetchPlaylists();
    };

    // Delete entire playlist
    window.deletePlaylist = function (playlistName) {
        let playlists = JSON.parse(localStorage.getItem("playlists"));
        delete playlists[playlistName];

        localStorage.setItem("playlists", JSON.stringify(playlists));
        fetchPlaylists();
    };

    fetchPlaylists();
});
