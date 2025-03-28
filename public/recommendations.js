document.addEventListener('DOMContentLoaded', () => {
    const songId = new URLSearchParams(window.location.search).get('id');
    if (!songId) return;

    fetch(`/api/music/recommendations/${songId}`)
        .then(res => res.json())
        .then(data => displayRecommendations(data))
        .catch(err => console.error('Error loading recommendations:', err));
});

function displayRecommendations(songs) {
    const list = document.getElementById('recommendations-list');
    list.innerHTML = songs.map(song => `<li>${song.title} - ${song.genre}</li>`).join('');
}
