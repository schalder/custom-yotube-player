// custom-yt-player.js
function onPlayerReady(event) {
    const playPauseButton = document.getElementById('play-pause');
    const customPlayButton = document.getElementById('custom-play-button');
    const muteUnmuteButton = document.getElementById('mute-unmute');
    const progressBar = document.getElementById('progress');
    const volumeControl = document.getElementById('volume');
    const videoOverlay = document.getElementById('video-overlay');
    const customControls = document.getElementById('custom-controls');
    const timeDisplay = document.getElementById('time-display');

    customPlayButton.onclick = videoOverlay.onclick = function() {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    };

    playPauseButton.onclick = function() {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    };

    muteUnmuteButton.onclick = function() {
        if (player.isMuted()) {
            player.unMute();
            muteUnmuteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        } else {
            player.mute();
            muteUnmuteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
    };

    progressBar.oninput = function() {
        const duration = player.getDuration();
        const seekTo = duration * (progressBar.value / 100);
        player.seekTo(seekTo, true);
    };

    volumeControl.oninput = function() {
        const volume = volumeControl.value;
        player.setVolume(volume);
    };

    setInterval(() => {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        progressBar.value = (currentTime / duration) * 100;

        const remainingTime = duration - currentTime;
        const minutes = Math.floor(remainingTime / 60);
        const seconds = Math.floor(remainingTime % 60);
        const totalMinutes = Math.floor(duration / 60);
        const totalSeconds = Math.floor(duration % 60);
        timeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds} / ${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
    }, 1000);

    document.querySelector('.video-container').addEventListener('mouseover', () => {
        customControls.style.opacity = 1;
    });

    document.querySelector('.video-container').addEventListener('mouseout', () => {
        customControls.style.opacity = 0;
    });
}

function onPlayerStateChange(event) {
    const playPauseButton = document.getElementById('play-pause');
    const customPlayButton = document.getElementById('custom-play-button');
    const videoOverlay = document.getElementById('video-overlay');

    if (event.data === YT.PlayerState.PLAYING) {
        playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        customPlayButton.style.display = 'none'; // Hide custom play button when playing
    } else {
        playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        customPlayButton.style.display = 'block'; // Show custom play button when paused or ended
    }

    if (event.data === YT.PlayerState.ENDED) {
        customPlayButton.style.display = 'block'; // Show custom play button when video ends
        videoOverlay.style.background = `url('https://img.youtube.com/vi/${player.getVideoData().video_id}/maxresdefault.jpg') no-repeat center center`;
        videoOverlay.style.backgroundSize = 'cover';
    } else {
        videoOverlay.style.background = 'transparent'; // Remove background when not ended
    }

    if (event.data === YT.PlayerState.PAUSED) {
        player.seekTo(player.getCurrentTime(), true); // Reload the current video frame without suggested videos
    }
}

// Disable right-click context menu on the iframe
document.addEventListener('contextmenu', function(event) {
    if (event.target.nodeName === 'IFRAME') {
        event.preventDefault();
    }
});
