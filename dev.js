const port = process.env.PORT || 3000;
const express = require('express');

// Start server
const app = express();
app.use(express.json());
app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
app.post("/", (request, response) => {
  let content = request.body;
  console.log(content);
  response.sendStatus(200);
});