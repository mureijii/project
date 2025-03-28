document.addEventListener("DOMContentLoaded", () => {
    const playlist = document.getElementById("playlist");
    let draggedItem = null;

    // Make each song draggable
    playlist.querySelectorAll(".song").forEach(song => {
        song.draggable = true;
        song.addEventListener("dragstart", (e) => {
            draggedItem = song;
            e.dataTransfer.effectAllowed = "move";
            e.target.classList.add("dragging");
        });

        song.addEventListener("dragend", () => {
            draggedItem.classList.remove("dragging");
            draggedItem = null;
            savePlaylistOrder();
        });
    });

    // Handle drop events on the playlist
    playlist.addEventListener("dragover", (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(playlist, e.clientY);
        if (afterElement == null) {
            playlist.appendChild(draggedItem);
        } else {
            playlist.insertBefore(draggedItem, afterElement);
        }
    });

    // Function to find the closest element below drag position
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll(".song:not(.dragging)")];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Save the new order to the backend
    function savePlaylistOrder() {
        const songIds = [...playlist.children].map(song => song.dataset.id);
        fetch("/api/playlists/reorder", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ songOrder: songIds })
        }).then(response => response.json())
          .then(data => console.log("Playlist updated:", data))
          .catch(error => console.error("Error updating playlist order:", error));
    }
});
