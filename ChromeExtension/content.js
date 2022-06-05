let timer = 0

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    sendResponse({
        response: "Message Received! (content)"
    });
	if(document.getElementsByClassName("byline style-scope ytmusic-player-bar complex-string")[0] !== undefined) {
    sendMessage();
	}
});

function wait(ms=1000) {
    timer = 1
    setTimeout(function(){
        timer = 0
    }, ms);
}

function sendMessage() {
	const songName = document.getElementsByClassName("title style-scope ytmusic-player-bar")[0].innerHTML;
    const artistName = document.getElementsByClassName("byline style-scope ytmusic-player-bar complex-string")[0].innerText;
    const time = document.getElementsByClassName("time-info style-scope ytmusic-player-bar")[0].innerText.toString().split('/');
    const playing = navigator.mediaSession.playbackState === 'playing'
    chrome.runtime.sendMessage({
        song: songName,
        artist: artistName,
        timeMax: time[1],
        currentTime: time[0],
        playing: playing,
        url: window.location.href
    });
}