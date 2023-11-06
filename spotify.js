const urlParams = new URLSearchParams(window.location.search);
let code = urlParams.get('code');
let codeVerifier = localStorage.getItem('code_verifier');
const redirectUri = `${window.location.origin}/visualizer/spotify.html`;
const clientId = '201bae405c6d47c49e045f8734fc82da';
let LAST_SWITCHED_VIDEO = new Date(0);
const VIDEO_PLAY_DURATION = 20000; // loop videos for 20 seconds before switching


let body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier
});

const response = fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body
})
    .then(response => {
        if (!response.ok) {
            throw new Error('HTTP status ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log(`data.access_token: ${data.accessToken}`);
        localStorage.setItem('access_token', data.access_token);
    })
    .catch(error => {
        console.error('Error:', error);
    });

async function getCurrentlyPlaying(accessToken) {
    accessToken = localStorage.getItem('access_token');

    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });

    // nothing playing
    if (response.status === 204) {
        await playVideo();
        return;
    }

    const json = await response.json();

    // playback paused
    if (!json.is_playing) {
        await playVideo();
        return;
    }

    stopVideo();
    return json;
}

function getImageFromCurrentlyPlaying(playingJson) {
    return playingJson.item.album.images[0].url;
}

async function playVideo() {
    var art = document.getElementById("album-art");
    art.style.display = 'none';

    var videoPlayer = document.getElementById("video-player");
    videoPlayer.style.display = "";
    var numVideos = 782;

    async function play() {
        if (Date.now() - LAST_SWITCHED_VIDEO < VIDEO_PLAY_DURATION) {
            console.log(`skipping play`);
            return;
        }
        console.log(`switching video`);
        const randIndex = Math.floor(Math.random() * numVideos) + 1;
        videoPlayer.src = "videos/" + randIndex + ".mp4";
        console.log(videoPlayer.src)
        videoPlayer.load();
        await videoPlayer.play();
        LAST_SWITCHED_VIDEO = Date.now();
    }
    await play();
}

function stopVideo() {
    var videoPlayer = document.getElementById("video-player");
    videoPlayer.style.display = 'none';
    videoPlayer.pause();
}

await playVideo();

setInterval(async () => {
    const token = localStorage.getItem('access_token');
    const nowPlaying = await getCurrentlyPlaying(token);
    if (nowPlaying) {
        const imgUrl = getImageFromCurrentlyPlaying(nowPlaying);
        const pageImg = document.getElementById('album-art');
        pageImg.src = imgUrl;
        pageImg.style.display = "";
    }
}, 5000)
