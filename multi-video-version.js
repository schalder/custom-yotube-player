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

        let controlsTimeout;

        const showControls = () => {
            customControls.style.opacity = 1;
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(() => {
                customControls.style.opacity = 0;
            }, 2000);
        };

        const hideControls = () => {
            customControls.style.opacity = 0;
        };

        customPlayButton.onclick = videoOverlay.onclick = function() {
            if (players[index].getPlayerState() === YT.PlayerState.PLAYING) {
                players[index].pauseVideo();
            } else {
                players[index].playVideo();
            }
            showControls();
        };

        playPauseButton.onclick = function() {
            if (players[index].getPlayerState() === YT.PlayerState.PLAYING) {
                players[index].pauseVideo();
            } else {
                players[index].playVideo();
            }
            showControls();
        };

        muteUnmuteButton.onclick = function() {
            if (players[index].isMuted()) {
                players[index].unMute();
                muteUnmuteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
            } else {
                players[index].mute();
                muteUnmuteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
            showControls();
        };

        progressBar.oninput = function() {
            const duration = players[index].getDuration();
            const seekTo = duration * (progressBar.value / 100);
            players[index].seekTo(seekTo, true);
            showControls();
        };

        volumeControl.oninput = function() {
            const volume = volumeControl.value;
            players[index].setVolume(volume);
            showControls();
        };

        fullScreenButton.addEventListener('click', () => {
            toggleFullScreen(container);
            showControls();
        });

        function toggleFullScreen(container) {
            if (!document.fullscreenElement) {
                container.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }

        setInterval(() => {
            const currentTime = players[index].getCurrentTime();
            const duration = players[index].getDuration();
            progressBar.value = (currentTime / duration) * 100;

            const remainingTime = duration - currentTime;
            const minutes = Math.floor(remainingTime / 60);
            const seconds = Math.floor(remainingTime % 60);
            const totalMinutes = Math.floor(duration / 60);
            const totalSeconds = Math.floor(duration % 60);
            timeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds} / ${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
        }, 1000);

        container.addEventListener('mousemove', showControls);
        container.addEventListener('mouseleave', hideControls);
    };
}

function onPlayerStateChange(index) {
    return function(event) {
        console.log(`Player ${index} state changed to ${event.data}.`);
        const container = document.querySelectorAll('.video-container')[index];
        const customPlayButton = container.querySelector('.custom-play-button');
        const videoOverlay = container.querySelector('.video-overlay');

        if (event.data === YT.PlayerState.PLAYING) {
            customPlayButton.style.display = 'none'; // Hide custom play button when playing
        } else {
            customPlayButton.style.display = 'block'; // Show custom play button when paused or ended
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
