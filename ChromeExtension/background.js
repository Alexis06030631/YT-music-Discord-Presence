async function updateRichPresence(songName, artistName, timeMax, currentTime, playing, url) {
    const data = {
        song: songName,
        artist: artistName,
        timeMax: timeMax,
        currentTime: currentTime,
        playing: playing,
        url: url
    };

    await fetch('http://localhost:3000/', {
        method: 'POST',
        headers: {
            "Access-Control-Allow-Origin": "http://localhost:3000",
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.tabs.get(tabId, async (tab) => {
        if(tab.audible) {
            chrome.tabs.sendMessage(tabId, {
                message: 'send'
            });
        }
    })
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    updateRichPresence(request.song, request.artist, request.timeMax, request.currentTime, request.playing, request.url);
});