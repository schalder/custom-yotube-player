function initializeVideoPlayer(container) {
    const videoId = container.dataset.videoId;
    const player = new YT.Player(container.querySelector('.player'), {
        height: '360',
        width: '640',
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
}

function onPlayerReady(event, container) {
    const player = event.target;
    const playPauseButton = container.querySelector('.play-pause');
    const customPlayButton = container.querySelector('.custom-play-button');
    const muteUnmuteButton = container.querySelector('.mute-unmute');
    const progressBar = container.querySelector('.progress');
    const volumeControl = container.querySelector('.volume');
    const videoOverlay = container.querySelector('.video-overlay');
    const customControls = container.querySelector('.custom-controls');
    const timeDisplay = container.querySelector('.time-display');

    customPlayButton.onclick = videoOverlay.onclick = () => {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    };

    playPauseButton.onclick = () => {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    };

    muteUnmuteButton.onclick = () => {
        if (player.isMuted()) {
            player.unMute();
            muteUnmuteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        } else {
            player.mute();
            muteUnmuteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
    };

    progressBar.oninput = () => {
        const duration = player.getDuration();
        const seekTo = duration * (progressBar.value / 100);
        player.seekTo(seekTo, true);
    };

    volumeControl.oninput = () => {
        const volume = volumeControl.value;
        player.setVolume(volume);
    };

    setInterval(() => {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        progressBar.value = (currentTime / duration) * 100;

        const currentMinutes = Math.floor(currentTime / 60);
        const currentSeconds = Math.floor(currentTime % 60);
        const totalMinutes = Math.floor(duration / 60);
        const totalSeconds = Math.floor(duration % 60);
        timeDisplay.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds} / ${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
    }, 1000);

    container.addEventListener('mouseover', () => {
        customControls.style.opacity = 1;
    });

    container.addEventListener('mouseout', () => {
        customControls.style.opacity = 0;
    });
}

function onPlayerStateChange(event, container) {
    const player = event.target;
    const playPauseButton = container.querySelector('.play-pause');
    const customPlayButton = container.querySelector('.custom-play-button');
    const videoOverlay = container.querySelector('.video-overlay');

    if (event.data === YT.PlayerState.PLAYING) {
        playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        customPlayButton.style.display = 'none';
    } else {
        playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        customPlayButton.style.display = 'block';
    }

    if (event.data === YT.PlayerState.ENDED) {
        customPlayButton.style.display = 'block';
        videoOverlay.style.background = `url('https://img.youtube.com/vi/${container.dataset.videoId}/0.jpg') no-repeat center center`;
        videoOverlay.style.backgroundSize = 'cover';
    } else {
        videoOverlay.style.background = 'transparent';
    }

    if (event.data === YT.PlayerState.PAUSED) {
        player.seekTo(player.getCurrentTime(), true);
    }
}

function onYouTubeIframeAPIReady() {
    const videoContainers = document.querySelectorAll('.video-container');
    videoContainers.forEach(container => {
        initializeVideoPlayer(container);
    });
}

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

document.addEventListener('contextmenu', function(event) {
    if (event.target.nodeName === 'IFRAME') {
        event.preventDefault();
    }
});

const faScript = document.createElement('script');
faScript.src = 'https://kit.fontawesome.com/c2410f4356.js';
faScript.crossOrigin = 'anonymous';
document.head.appendChild(faScript);
</script>
