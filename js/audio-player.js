document.addEventListener("DOMContentLoaded", () => {
    const bgMusic = document.getElementById("bgMusic");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const volumeSlider = document.getElementById("volumeSlider");
    const progressSlider = document.querySelector(".music-player .progress");
    const timeDisplay = document.getElementById("timeDisplay");
    const durationDisplay = document.querySelector(".music-player .duration");
    const musicPlayer = document.querySelector(".music-player");

    if (!bgMusic || !playPauseBtn || !musicPlayer) return;

    let isPlaying = false;

    // Optional: restore volume from localStorage
    const savedVol = localStorage.getItem("jcd_vol");
    if (savedVol !== null) {
        bgMusic.volume = savedVol;
        if (volumeSlider) volumeSlider.value = savedVol;
    }

    function togglePlay() {
        if (isPlaying) {
            bgMusic.pause();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            musicPlayer.classList.remove("playing");
        } else {
            bgMusic.play().catch(e => console.log("Autoplay blocked:", e));
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            musicPlayer.classList.add("playing");
        }
        isPlaying = !isPlaying;
    }

    // Attempt to auto-play if previously playing (requires user interaction first typically)
    const savedState = localStorage.getItem("jcd_playing");
    if (savedState === "true") {
        bgMusic.play().then(() => {
            isPlaying = true;
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            musicPlayer.classList.add("playing");
        }).catch(() => {
            // Autoplay blocked by browser
            isPlaying = false;
        });
    }

    playPauseBtn.addEventListener("click", () => {
        togglePlay();
        localStorage.setItem("jcd_playing", isPlaying);
    });

    if (volumeSlider) {
        volumeSlider.addEventListener("input", (e) => {
            bgMusic.volume = e.target.value;
            localStorage.setItem("jcd_vol", e.target.value);
        });
    }

    bgMusic.addEventListener("timeupdate", () => {
        if (progressSlider) {
            const progress = (bgMusic.currentTime / bgMusic.duration) * 100;
            progressSlider.value = progress || 0;
        }

        if (timeDisplay) {
            const currentMins = Math.floor(bgMusic.currentTime / 60);
            const currentSecs = Math.floor(bgMusic.currentTime % 60);
            timeDisplay.textContent = `${currentMins}:${currentSecs.toString().padStart(2, '0')}`;
        }
    });

    bgMusic.addEventListener("loadedmetadata", () => {
        if (durationDisplay) {
            const durationMins = Math.floor(bgMusic.duration / 60);
            const durationSecs = Math.floor(bgMusic.duration % 60);
            durationDisplay.textContent = `${durationMins}:${durationSecs.toString().padStart(2, '0')}`;
        }
    });

    if (progressSlider) {
        progressSlider.addEventListener("input", (e) => {
            const seekTime = (e.target.value / 100) * bgMusic.duration;
            bgMusic.currentTime = seekTime;
        });
    }
});
