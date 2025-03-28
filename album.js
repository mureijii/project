document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/albums')
        .then(res => res.json())
        .then(data => displayAlbums(data))
        .catch(err => console.error('Error loading albums:', err));
});

function displayAlbums(albums) {
    const albumList = document.getElementById('albums-list');
    albumList.innerHTML = '';

    albums.forEach(album => {
        const albumDiv = document.createElement('div');
        albumDiv.classList.add('album');

        albumDiv.innerHTML = `
            <img src="${album.coverImage}" alt="${album.title}">
            <h2>${album.title}</h2>
            <p>By: ${album.artist.name}</p>
            <ul>${album.songs.map(song => `<li>${song.title}</li>`).join('')}</ul>
        `;

        albumList.appendChild(albumDiv);
    });
}
