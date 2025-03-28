document.addEventListener("DOMContentLoaded", async () => {
    const musicList = document.getElementById("music-list");

    try {
        const response = await fetch("http://localhost:5000/api/music");
        const songs = await response.json();

        songs.forEach(song => {
            const div = document.createElement("div");
            div.innerHTML = `
                <h3>${song.title} - ${song.artist}</h3>
                <audio controls>
                    <source src="${song.url}" type="audio/mpeg">
                </audio>
                <hr>
            `;
            musicList.appendChild(div);
        });
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
});
