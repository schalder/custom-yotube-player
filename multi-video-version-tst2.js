let players = [];

function onYouTubeIframeAPIReady() {
    console.log("YouTube Iframe API is ready.");
    document.querySelectorAll('.video-container').forEach((container, index) => {
        const videoId = container.getAttribute('data-video-id');
        const playerElement = container.querySelector('.player');
        const width = container.getAttribute('data-width') || '100%';
        const height = container.getAttribute('data-height') || '100%';

        console.log(`Initializing player ${index} with video ID ${videoId}, width ${width}, height ${height}`);

        let adjustedHeight = height; // Store the original height

        // Adjust height for small screens
        if (window.innerWidth <= 768) {
            adjustedHeight = 'calc(100vw * 0.5625 - 30px)';
            // Subtract 30px to accommodate the control bar
        }

        players[index] = new YT.Player(playerElement, {
            height: adjustedHeight,
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

        container.addEventListener('mouseenter', showControls);
        customControls.addEventListener('mouseenter', showControls);

        container.addEventListener('mouseleave', scheduleHideControls);
        customControls.addEventListener('mouseleave', scheduleHideControls);

        container.addEventListener('touchstart', showControls);
        customControls.addEventListener('touchstart', showControls);

        container.addEventListener('touchend', scheduleHideControls);
        customControls.addEventListener('touchend', scheduleHideControls);

        hideControlsTimeout = setTimeout(hideControls, 6000);

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
            customPlayButton.style.display = 'none';
            setTimeout(() => {
                customControls.classList.add('hidden');
            }, 6000);
        } else {
            customPlayButton.style.display = 'block';
            customControls.classList.remove('hidden');
        }

        if (event.data === YT.PlayerState.ENDED) {
            customPlayButton.style.display = 'block';
            videoOverlay.style.background = `url('https://img.youtube.com/vi/${container.getAttribute('data-video-id')}/maxresdefault.jpg') no-repeat center center`;
            videoOverlay.style.backgroundSize = 'cover';
        } else {
            videoOverlay.style.background = 'transparent';
        }

        if (event.data === YT.PlayerState.PAUSED) {
            videoOverlay.style.background = `url('https://img.youtube.com/vi/${container.getAttribute('data-video-id')}/maxresdefault.jpg') no-repeat center center`;
            videoOverlay.style.backgroundSize = 'cover';
        }
    };
}

document.addEventListener('contextmenu', function(event) {
    if (event.target.nodeName === 'IFRAME') {
        event.preventDefault();
    }
});
