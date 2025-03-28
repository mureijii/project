document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const resultsContainer = document.getElementById("results");
    const playlistContainer = document.getElementById("playlist-container");
    const API_KEY = "YOUR_YOUTUBE_API_KEY"; // Replace with your YouTube Data API v3 key

    // YouTube Search Function
    async function searchYouTube(query) {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=10`
        );
        const data = await response.json();

        displayResults(data.items);
    }

    // Display Search Results
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

    // Add video to playlist
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

    // Event listener for search button
    searchButton.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query !== "") {
            searchYouTube(query);
        }
    });

    // Search on "Enter" key press
    searchInput.addEventListener("keypress", event => {
        if (event.key === "Enter") {
            searchButton.click();
        }
    });
});
