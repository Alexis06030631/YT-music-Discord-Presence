let timer = 5000
let ws = new WebSocket('ws://localhost:3000/');

ws.addEventListener('open', function (event) {
    console.log('Connected to web socket server !');
});

ws.addEventListener('message', function (event) {
    switch (event.data) {
        case 'refresh':
            sendMessage();
            break;
    }
});

// Check if web socket is connected
function checkWs(){
    if(ws.readyState !== 1){
        ws = new WebSocket('ws://localhost:3000/');
        return false
    }else return true
}

function hide() {
    if(!checkWs()) throw new Error('Web socket is not connected !');
    ws.send(JSON.stringify({code: 'hide'}));
}

// On webpage change
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    sendResponse({
        response: "Message Received! (content)"
    });
	if(document.getElementsByClassName("byline style-scope ytmusic-player-bar complex-string")[0] !== undefined) {
    sendMessage();
	}
});

// Update rich presence every x seconds
setInterval(function(){
    if(document.getElementsByClassName("byline style-scope ytmusic-player-bar complex-string")[0] !== undefined){
        sendMessage();
    }
}, timer);


// Send data message to the web socket server
function sendMessage() {
    if(!checkWs())return null
	const songName = document.getElementsByClassName("title style-scope ytmusic-player-bar")[0].innerHTML || navigator.mediaSession.metadata.title;
    const artistName = document.getElementsByClassName("byline style-scope ytmusic-player-bar complex-string")[0].innerText || navigator.mediaSession.metadata.artist;
    const time = document.getElementsByClassName("time-info style-scope ytmusic-player-bar")[0].innerText.toString().split('/');
    const playing = navigator.mediaSession.playbackState === 'playing'

    const data = {
        code: 'update',
        song: songName,
        artist: artistName,
        timeMax: time[1],
        currentTime: time[0],
        playing: playing,
        url: window.location.href
    };

    ws.send(JSON.stringify(data));
}


docReady(function() {
    // Add a button to the page to hide the rich presence
    const pg_player = document.getElementById('player-page');
    const img = document.createElement("img");
    img.src = "https://i0.wp.com/socialbarrel.com/wp-content/uploads/2021/09/discord-youtube-integration.png";
    img.style = 'position: absolute;top: 0px;width: 80px;height: 80px;z-index: 999;margin: 5px;opacity: 0.6;cursor: pointer;';
    img.setAttribute('id', 'hide-button');
    pg_player.appendChild(img);

    document.getElementById('hide-button').addEventListener('click', function() {
        hide();
    })
});


function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}