let button
/*********
 * Wait for the DOM to be loaded
 */
docReady(function() {
    // Set the icon button
    buttonPlace = document.getElementById('player-page');

    UpdateIcon(1)

    document.getElementById('YTmusic_status_ds').addEventListener('click', function(e) {
        changeStatus(Number(this.getAttribute('switcher')));
    })

    wsConnect()
});

// On webpage is loaded
function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

/*********
 * Create icon button and add it to the page
 * Create function UpdateIcon() to update the icon
 */

const url = chrome.runtime.getURL('');
let buttonPlace
const img = document.createElement("img");
img.style = 'position: absolute;top: 0px;width: 80px;height: 80px;z-index: 999;margin: 5px;opacity: 0.6;cursor: pointer;';
img.id = 'YTmusic_status_ds';


function UpdateIcon(id) {
    let reply = false

    if(ws?.readyState !== 1){
        img.src = `${url}images/logo_offline.png`;
        img.title = 'Offline, launch YTmusic presence then click here to refresh';
        reply = false
    }else {
        switch (id) {
            case 1:
                img.src = `${url}images/logo.webp`;
                img.title = 'Show, click here to hide';
                initAutoUpdate()
                break
            case 2:
                img.src = `${url}images/logo_off.png`;
                img.title = 'Hidden, click here to show';
                destoyIntervals()
        }
        reply = true
    }

    img.setAttribute('switcher', `${reply?id:3}`);
    buttonPlace.appendChild(img);
    return reply
}

/*********
 * Init web socket server
 * Try to connect to the web socket server
 */
let ws
function wsConnect(){
    ws = new WebSocket('ws://localhost:3000/');

    ws.addEventListener('error', function(e) {
        UpdateIcon(3)
        destoyIntervals()
        console.log(e)
    })
    ws.addEventListener('close', function(e) {
        UpdateIcon(3)
        destoyIntervals()
        console.log(e)

    })

    ws.addEventListener('open', function (event) {
        console.log('Connected to web socket server !');
        UpdateIcon(1)
        initAutoUpdate()
    });

    ws.addEventListener('message', function (event) {
        switch (event.data) {
            case 'refresh':
                sendMessage();
                break;
        }
    });
}

// Change the icon status onclick on the button
function changeStatus(id) {
    switch (id) {
        case 1:
            if(UpdateIcon(2)) ws.send(JSON.stringify({code: 'hide'}));
            break
        case 2:
            initAutoUpdate()
            if(UpdateIcon(1)) ws.send(JSON.stringify({code: 'show'}));
            break
        case 3:
            wsConnect()
    }
}



// Send data message to the web socket server
function sendMessage() {
    if(ws?.readyState !== 1)return null
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

let autoInterval = false
// Auto update rich presence every x seconds
setInterval(function(){
    if(autoInterval){
        if(document.getElementsByClassName("byline style-scope ytmusic-player-bar complex-string")[0] !== undefined){
            sendMessage();
        }
    }
}, 5000);

function initAutoUpdate(){
    // On webpage change (new music)
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        sendResponse({
            response: "Message Received! (content)"
        });
        if(document.getElementsByClassName("byline style-scope ytmusic-player-bar complex-string")[0] !== undefined) {
            sendMessage();
        }
    });
    autoInterval = true
}

function destoyIntervals(){
    try{
        autoInterval = false
        chrome.runtime.onMessage.removeListener(function(request, sender, sendResponse) {})
    }catch (e){console.log(e)}
}