let launch = false
let hidden = false
let tempTime = '0:00';
let startTimeOut = 3000
let song = 'Waiting for music...';

const clientId = '983039263287414814';
const port = process.env.PORT || 3000;


const { WebSocketServer } =  require('ws');
const RPC = require("discord-rpc");

let client

// Log in to RPC with client id
connectDiscord()
function connectDiscord(){
    launch = true
    client = new RPC.Client({ transport: 'ipc' });
    client.on('ready', () => {
        console.log('Logged to Discord in as', client.user.username);
        startWbserver()
    });
    client.login({ clientId });
}


process.on('uncaughtException', function(err) {
    if(launch){
        //GITHUB CI, ALWAYS GET THIS AS LAST
        if (process.env.GITHUB_ACTION){
            process.exit(0)
        }
        console.log(`Fail to connect to Discord, retrying in ${startTimeOut}ms...`);
        setTimeout(connectDiscord, startTimeOut);
        if (startTimeOut <= 180000) startTimeOut *= 2;
    }else {
        console.log(err)
        process.exit(1);
    }
})

return null

function startWbserver(){
    launch = false
    console.log('Starting YT music presence...')
    // Start server
    const wss = new WebSocketServer({ port: port });
    wss.on('connection', function connection(ws, req) {
        console.log(`YT music websocket was connected from ${req.connection.remoteAddress}`);

        ws.on('message', function message(data) {
            let content = JSON.parse(data);
            if(content.code === 'update') {
                if(hidden) return null
                tempTime = content.timeMax.replace(' ', '');
                let currentTime = content.currentTime.replace(' ', '');
                song = content.song

                const timeMax = `${Number(tempTime.split(':')[0]) - Number(currentTime.split(':')[0])}:${Number(tempTime.split(':')[1]) - Number(currentTime.split(':')[1])}`;

                update(content.playing, song, content.artist, Date.now(), timeToMilli(timeMax), content.url);
            }else if(content.code === 'hide') {
                client.request('SET_ACTIVITY', {
                    pid: process.pid,
                    activity: {}
                });
                hidden = true;
                console.log(`${new Date().toLocaleTimeString()} Rich presence hidden`);
            }else if(content.code === 'show'){
                ws.send('refresh')
                hidden = false;
                console.log(`${new Date().toLocaleTimeString()} Rich presence was reactivated`);
            }
        });
    });
}

// Update Rich Presence
function update(playing, song, artist, timeNow, timeMax, url) {
    artist = artist.replaceAll('\n', '').split('•')[0];

    let data = {
        state: `${artist}${playing? '': '\n • Paused'}`,
        details: song,

        assets: {
            large_image: 'ytmusic',
            large_text: 'YouTube Music (by Aleжis#7808)',
            small_image: playing ? 'play': 'pause',
            small_text: playing ? 'Playing' : 'Paused'
        },

        instance: true,
        buttons: [
            {
                label: "Listen now",
                url: url
            }
        ]
    }
    if(playing) {
        Object.assign(data, {timestamps:{start: timeNow, end: timeMax}})
    }
    if(process.env.debug_mode) console.log(`${new Date().toLocaleTimeString()} Presence updated: Song=${song} author=${artist} playing=${playing}`);
    client.request('SET_ACTIVITY', {
        pid: process.pid,
        activity: data
    });
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