let players = [];

function onYouTubeIframeAPIReady() {
    console.log("YouTube Iframe API is ready.");
    document.querySelectorAll('.video-container').forEach((container, index) => {
        const videoId = container.getAttribute('data-video-id');
        const playerElement = container.querySelector('.player');
        const width = container.getAttribute('data-width') || '100%';
        const height = container.getAttribute('data-height') || '100%';

        console.log(`Initializing player ${index} with video ID ${videoId}, width ${width}, height ${height}`);

        players[index] = new YT.Player(playerElement, {
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
                'onReady': onPlayerReady(index),
                'onStateChange': onPlayerStateChange(index)
            }
        });
    });
}

function onPlayerReady(index) {
    return function(event) {
        console.log(`Player ${index} is ready.`);
        const container = document.querySelectorAll('.video-container')[index];
        const playPauseButton = container.querySelector('.play-pause');
        const customPlayButton = container.querySelector('.custom-play-button');
        const muteUnmuteButton = container.querySelector('.mute-unmute');
        const progressBar = container.querySelector('.progress');
        const volumeControl = container.querySelector('.volume');
        const videoOverlay = container.querySelector('.video-overlay');
        const timeDisplay = container.querySelector('.time-display');
        const fullScreenButton = container.querySelector('.full-screen');
        const customControls = container.querySelector('.custom-controls');

        let hideControlsTimeout;

        function showControls() {
            customControls.classList.remove('hidden');
            clearTimeout(hideControlsTimeout);
        }

        function hideControls() {
            if (players[index].getPlayerState() === YT.PlayerState.PLAYING) {
                customControls.classList.add('hidden');
            }
        }

        function scheduleHideControls() {
            hideControlsTimeout = setTimeout(() => {
                if (!container.matches(':hover') && !customControls.matches(':hover')) {
                    hideControls();
                }
            }, 6000);
        }

        customPlayButton.onclick = videoOverlay.onclick = function() {
            if (players[index].getPlayerState() === YT.PlayerState.PLAYING) {
                players[index].pauseVideo();
                playPauseButton.innerHTML = '<i class="fa-solid fa-play"></i>';
            } else {
                players[index].playVideo();
                playPauseButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
            }
        };

        playPauseButton.onclick = function() {
            if (players[index].getPlayerState() === YT.PlayerState.PLAYING) {
                players[index].pauseVideo();
                playPauseButton.innerHTML = '<i class="fa-solid fa-play"></i>';
            } else {
                players[index].playVideo();
                playPauseButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
            }
        };

        muteUnmuteButton.onclick = function() {
            if (players[index].isMuted()) {
                players[index].unMute();
                muteUnmuteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
            } else {
                players[index].mute();
                muteUnmuteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
        };

        progressBar.oninput = function() {
            const duration = players[index].getDuration();
            const seekTo = duration * (progressBar.value / 100);
            players[index].seekTo(seekTo, true);
        };

        volumeControl.oninput = function() {
            const volume = volumeControl.value;
            players[index].setVolume(volume);
        };

        fullScreenButton.addEventListener('click', () => toggleFullScreen(container));

        function toggleFullScreen(container) {
            if (!document.fullscreenElement) {
                container.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }

        setInterval(() => {
            const currentTime = players[index].getCurrentTime();
            const minutes = Math.floor(currentTime / 60);
            const seconds = Math.floor(currentTime % 60);
            timeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }, 1000);

        // Event listeners for mouse enter and leave
        container.addEventListener('mouseenter', showControls);
        customControls.addEventListener('mouseenter', showControls);

        container.addEventListener('mouseleave', scheduleHideControls);
        customControls.addEventListener('mouseleave', scheduleHideControls);

        // Touch events
        container.addEventListener('touchstart', showControls);
        customControls.addEventListener('touchstart', showControls);

        container.addEventListener('touchend', scheduleHideControls);
        customControls.addEventListener('touchend', scheduleHideControls);

        // Initially hide controls after 6 seconds
        hideControlsTimeout = setTimeout(hideControls, 6000);

        // Keyboard shortcuts
        document.addEventListener('keydown', function(event) {
            switch (event.key) {
                case 'ArrowRight':
                    players[index].seekTo(players[index].getCurrentTime() + 10, true); // Forward 10 seconds
                    break;
                case 'ArrowLeft':
                    players[index].seekTo(players[index].getCurrentTime() - 10, true); // Backward 10 seconds
                    break;
                case 'ArrowUp':
                    players[index].setVolume(Math.min(players[index].getVolume() + 10, 100)); // Increase volume
                    break;
                case 'ArrowDown':
                    players[index].setVolume(Math.max(players[index].getVolume() - 10, 0)); // Decrease volume
                    break;
            }
        });
    };
}


function onPlayerStateChange(index) {
    return function(event) {
        console.log(`Player ${index} state changed to ${event.data}.`);
        const container = document.querySelectorAll('.video-container')[index];
        const customPlayButton = container.querySelector('.custom-play-button');
        const videoOverlay = container.querySelector('.video-overlay');
        const customControls = container.querySelector('.custom-controls');

        if (event.data === YT.PlayerState.PLAYING) {
            customPlayButton.style.display = 'none'; // Hide custom play button when playing
            setTimeout(() => {
                customControls.classList.add('hidden');
            }, 6000); // Hide controls after 6 seconds of play
        } else {
            customPlayButton.style.display = 'block'; // Show custom play button when paused or ended
            customControls.classList.remove('hidden'); // Show controls when paused or ended
        }

        if (event.data === YT.PlayerState.ENDED) {
            customPlayButton.style.display = 'block'; // Show custom play button when video ends
            videoOverlay.style.background = `url('https://img.youtube.com/vi/${container.getAttribute('data-video-id')}/maxresdefault.jpg') no-repeat center center`;
            videoOverlay.style.backgroundSize = 'cover';
        } else {
            videoOverlay.style.background = 'transparent'; // Remove background when not ended
        }

        if (event.data === YT.PlayerState.PAUSED) {
            videoOverlay.style.background = `url('https://img.youtube.com/vi/${container.getAttribute('data-video-id')}/maxresdefault.jpg') no-repeat center center`;
            videoOverlay.style.backgroundSize = 'cover';
        }
    };
}

// Disable right-click context menu on the iframe
document.addEventListener('contextmenu', function(event) {
    if (event.target.nodeName === 'IFRAME') {
        event.preventDefault();
    }
});
