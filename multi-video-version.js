function onYouTubeIframeAPIReady() {
    const videoContainers = document.querySelectorAll('.video-container');
    videoContainers.forEach((container, index) => {
        const playerElement = container.querySelector('.player');
        const videoId = container.getAttribute('data-video-id');
        const width = container.getAttribute('data-width');
        const height = container.getAttribute('data-height');
        
        // Set custom properties for width and height
        container.style.setProperty('--custom-width', `${width}px`);
        container.style.setProperty('--custom-height', `${height}px`);

        const player = new YT.Player(playerElement, {
            height: height,
            width: width,
            videoId: videoId,
            playerVars: {
                'playsinline': 1,
                'autoplay': 0,
                'controls': 0,
                'showinfo': 0,
                'rel': 0,
                'modestbranding': 1,
                'iv_load_policy': 3,
                'disablekb': 1,
                'fs': 0,
                'origin': window.location.origin
            },
            events: {
                'onReady': (event) => onPlayerReady(event, container),
                'onStateChange': (event) => onPlayerStateChange(event, container)
            }
        });
        container.player = player;
    });
}


// Any other necessary code can be included here as well

function onPlayerReady(event, container) {
    const player = container.player;
    const playPauseButton = container.querySelector('.play-pause');
    const customPlayButton = container.querySelector('.custom-play-button');
    const muteUnmuteButton = container.querySelector('.mute-unmute');
    const progressBar = container.querySelector('.progress');
    const volumeControl = container.querySelector('.volume');
    const videoOverlay = container.querySelector('.video-overlay');
    const customControls = container.querySelector('.custom-controls');
    const timeDisplay = container.querySelector('.time-display');

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

    container.addEventListener('mouseover', () => {
        customControls.style.opacity = 1;
    });

    container.addEventListener('mouseout', () => {
        customControls.style.opacity = 0;
    });
}

function onPlayerStateChange(event, container) {
    const player = container.player;
    const playPauseButton = container.querySelector('.play-pause');
    const customPlayButton = container.querySelector('.custom-play-button');
    const videoOverlay = container.querySelector('.video-overlay');

    if (event.data === YT.PlayerState.PLAYING) {
        playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        customPlayButton.style.display = 'none'; //
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
