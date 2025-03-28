document.addEventListener("DOMContentLoaded", async () => {
    const playlistId = "your-playlist-id"; // Fetch dynamically in real scenario
    const songList = document.getElementById("song-list");

    // Fetch Playlist Songs
    async function fetchPlaylist() {
        try {
            const response = await fetch(`/api/playlists/${playlistId}`);
            const playlist = await response.json();

            document.getElementById("playlist-title").innerText = playlist.name;
            songList.innerHTML = "";

            playlist.songs.forEach(song => {
                const li = document.createElement("li");
                li.classList.add("music-item");
                li.dataset.id = song._id;
                li.innerHTML = `${song.title} <a href="${song.url}" target="_blank">▶</a>`;
                songList.appendChild(li);
            });

            initializeDragAndDrop();
        } catch (error) {
            console.error("Error fetching playlist:", error);
        }
    }

    // Add Song
    async function addSong() {
        const title = document.getElementById("song-title").value;
        const url = document.getElementById("song-url").value;

        if (!title || !url) return alert("Please enter song details!");

        try {
            const response = await fetch(`/api/playlists/${playlistId}/songs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, url }),
            });

            if (response.ok) {
                await fetchPlaylist();
                document.getElementById("song-title").value = "";
                document.getElementById("song-url").value = "";
            }
        } catch (error) {
            console.error("Error adding song:", error);
        }
    }

    // Enable Drag & Drop Reordering
    function initializeDragAndDrop() {
        new Sortable(songList, {
            animation: 150,
            onEnd: async function () {
                const newOrder = Array.from(songList.children).map(item => ({
                    id: item.dataset.id,
                }));

                try {
                    await fetch(`/api/playlists/${playlistId}/reorder`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ order: newOrder }),
                    });
                } catch (error) {
                    console.error("Error updating order:", error);
                }
            },
        });
    }

    fetchPlaylist();
});
