let currentAudio = null;

function playSong(url) {
    if (currentAudio) {
        currentAudio.pause();
    }

    currentAudio = new Audio(url);
    currentAudio.play();
}

function stopSong() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
}
