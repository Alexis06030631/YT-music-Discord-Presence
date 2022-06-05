const client = require('discord-rich-presence')('983039263287414814');
const port = process.env.PORT || 3000;
const express = require('express');

// Start server
const app = express();
app.use(express.json());
app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

let song = 'Waiting for music...';
let tempTime = '0:00';

console.log('Starting YT music presence...')

app.post("/", (request, response) => {
  let content = request.body;

  tempTime = content.timeMax.replace(' ', '');
  let currentTime = content.currentTime.replace(' ', '');
  song = content.song

  const timeMax = `${Number(tempTime.split(':')[0]) - Number(currentTime.split(':')[0])}:${Number(tempTime.split(':')[1]) - Number(currentTime.split(':')[1])}`;

  update(content.playing, song, content.artist, Date.now(), timeToMilli(timeMax), content.url);
});



// Update Rich Presence
function update(playing, song, artist, timeNow, timeMax, url) {
  artist = artist.replaceAll('\n', '').split('•')[0];


  let data = {
    state: `${artist}${playing? '': '\n • Paused'}`,
    details: song,
    largeImageKey: 'ytmusic',
    largeImageText: 'YouTube Music',
    smallImageKey: playing ? 'play': 'pause',
    smallImageText: playing ? 'Playing' : 'Paused',
    instance: true,
    buttons: [
      {
        label: "Listen now",
        url: url
      }
    ]
  }
  if(playing) {
    Object.assign(data, {startTimestamp: timeNow, endTimestamp: timeMax})
  }
  if(process.env.debug_mode) console.log(`${new Date().toLocaleTimeString()} Presence updated: Song=${song} author=${artist} playing=${playing}`);
  client.updatePresence(data);
}

// Milliseconds to time converter
function timeToMilli(time) {
  var temp = Date.now();
  if(time.split(':').length === 2) {
    temp += Math.round(parseFloat(time.split(':')[0]) * 60000);
    temp += Math.round(parseFloat(time.split(':')[1]) * 1000);
  } else if (time.split(':').length === 3) {
    temp += Math.round(parseFloat(time.split(':')[0]) * 3600000);
    temp += Math.round(parseFloat(time.split(':')[1]) * 60000);
    temp += Math.round(parseFloat(time.split(':')[2]) * 1000);
  }
  return temp;
}