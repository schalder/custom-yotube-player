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

        customPlayButton.onclick = videoOverlay.onclick = function() {
            if (players[index].getPlayerState() === YT.PlayerState.PLAYING) {
                players[index].pauseVideo();
            } else {
                players[index].playVideo();
            }
        };
        
        playPauseButton.onclick = function() {
            if (players[index].getPlayerState() === YT.PlayerState.PLAYING) {
                players[index].pauseVideo();
            } else {
                players[index].playVideo();
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

        fullScreenButton.addEventListener('click', () => {
            const playerElement = container; // Request full-screen mode for the container
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (playerElement.requestFullscreen) {
                playerElement.requestFullscreen();
            } else if (playerElement.mozRequestFullScreen) { /* Firefox */
                playerElement.mozRequestFullScreen();
            } else if (playerElement.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
                playerElement.webkitRequestFullscreen();
            } else if (playerElement.msRequestFullscreen) { /* IE/Edge */
                playerElement.msRequestFullscreen();
            }
        });

        document.addEventListener('fullscreenchange', () => toggleCustomControlsVisibility(container));
        document.addEventListener('mozfullscreenchange', () => toggleCustomControlsVisibility(container));
        document.addEventListener('webkitfullscreenchange', () => toggleCustomControlsVisibility(container));
        document.addEventListener('msfullscreenchange', () => toggleCustomControlsVisibility(container));

        function toggleCustomControlsVisibility(container) {
            const isFullScreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
            const display = isFullScreen ? 'block' : 'block';
            container.querySelector('.custom-controls').style.display = display;
            container.querySelector('.video-overlay').style.display = display;
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

        container.addEventListener('mouseover', () => {
            container.querySelector('.custom-controls').style.opacity = 1;
        });

        container.addEventListener('mouseout', () => {
            container.querySelector('.custom-controls').style.opacity = 0;
        });
    };
}

function onPlayerStateChange(index) {
    return function(event) {
        console.log(`Player ${index} state changed to ${event.data}.`);
        const container = document.querySelectorAll('.video-container')[index];
        const customPlayButton = container.querySelector('.custom-play-button');
        const videoOverlay = container.querySelector('.video-overlay');

        if (event.data === YT.PlayerState.PLAYING) {
            customPlayButton.style.display = 'none';
        } else {
            customPlayButton.style.display = 'block';
        }

        if (event.data === YT.PlayerState.ENDED || event.data === YT.PlayerState.PAUSED) {
            videoOverlay.style.background = `url('https://img.youtube.com/vi/${container.getAttribute('data-video-id')}/maxresdefault.jpg') no-repeat center center`;
            videoOverlay.style.backgroundSize = 'cover';
        } else {
            videoOverlay.style.background = 'transparent';
        }
    };
}

document.addEventListener('contextmenu', function(event) {
    if (event.target.nodeName === 'IFRAME') {
        event.preventDefault();
    }
});
