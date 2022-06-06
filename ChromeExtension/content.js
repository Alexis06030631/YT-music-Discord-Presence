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
    });
}