const fetch = require('node-fetch');
const express = require('express');

const app = express();
const port = process.env.PORT || 5000;



app.get('/api/images/:service/', (req, res) => {
  console.log(`Recieved image GET request for ${req.query.tags}`);

  let url = '';
  if(req.params.service == "gelbooru"){
    url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&limit=100&tags=${req.query.tags}&json=1`
  }

  fetch(url)
  .then((Data) => {return Data.json()})
  .then((Data) => {res.send(Data)})


});

app.listen(port, () => console.log(`Listening on port ${port}`));
