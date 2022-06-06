const port = process.env.PORT || 3000;
const express = require('express');
const cors = require('cors');

const { WebSocketServer } =  require('ws');

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });
});

// Start server
const app = express();
app.use(express.json());
const corsOptions ={
  origin:'https://music.youtube.com',
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
}
app.use(cors(corsOptions));
//app.listen(port, () => {
//  console.log(`Listening on port ${port}!`);
//});
app.post("/", (request, response) => {
  let content = request.body;
  console.log(content);
  response.sendStatus(200);
});