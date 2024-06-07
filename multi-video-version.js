let players = [];
let hideControlsTimeout;

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
        const customControls = container.querySelector('.custom-controls');
        const customPlayButton = container.querySelector('.custom-play-button');

        function showControls() {
            customControls.classList.remove('hidden');
            clearTimeout(hideControlsTimeout);
            if (players[index].getPlayerState() === YT.PlayerState.PLAYING) {
                hideControlsTimeout = setTimeout(hideControls, 4000);
            }
        }

        function hideControls() {
            if (!isMouseOverControlBar(container)) {
                customControls.classList.add('hidden');
            }
        }

        function isMouseOverControlBar(container) {
            const rect = container.getBoundingClientRect();
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            return (
                mouseX >= rect.left &&
                mouseX <= rect.right &&
                mouseY >= rect.top &&
                mouseY <= rect.bottom
            );
        }

        container.addEventListener('mouseover', showControls);
        container.addEventListener('mouseout', () => {
            hideControlsTimeout = setTimeout(hideControls, 4000);
        });

        container.addEventListener('touchstart', showControls);
        container.addEventListener('touchend', () => {
            hideControlsTimeout = setTimeout(hideControls, 4000);
        });

        // Initially hide controls after 4 seconds
        hideControlsTimeout = setTimeout(hideControls, 4000);

        // Play button click event
        customPlayButton.addEventListener('click', function() {
            if (players[index].getPlayerState() === YT.PlayerState.PLAYING) {
                players[index].pauseVideo();
            } else {
                players[index].playVideo();
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
            }, 4000); // Hide controls after 4 seconds of play
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

// Prevent hiding controls when interacting with control bar
document.querySelectorAll('.custom-controls').forEach((controlBar) => {
    controlBar.addEventListener('mouseover', function(event) {
        clearTimeout(hideControlsTimeout);
    });

    controlBar.addEventListener('mouseout', function(event) {
        hideControlsTimeout = setTimeout(hideControls, 4000);
    });
});

// Function to check if mouse is over the control bar
function isMouseOverControlBar(container, event) {
    const rect = container.getBoundingClientRect();
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    return (
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom
    );
}
