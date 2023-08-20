const urlParams = new URLSearchParams(window.location.search);
let code = urlParams.get('code');
let codeVerifier = localStorage.getItem('code_verifier');
const redirectUri = `${window.location.origin}/visualizer/spotify.html`;
const clientId = '201bae405c6d47c49e045f8734fc82da';

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

    return response.json();
}

function getImageFromCurrentlyPlaying(playingJson) {
    return playingJson.item.album.images[0].url;
}

const token = localStorage.getItem('access_token');
const nowPlaying = await getCurrentlyPlaying(token);
const imgUrl = getImageFromCurrentlyPlaying(nowPlaying);

const pageImg = document.getElementById('album');
pageImg.src = imgUrl;