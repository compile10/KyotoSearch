const fetch = require('node-fetch');
const express = require('express');
const parseString = require('xml2js').parseString;


const app = express();
const port = process.env.PORT || 5000;




function parseGelbooru(data){
    let frontData = [];
    for(let thisImage of data.posts.post){
      frontData.push({ 
        thumbURL: thisImage.$.preview_url,
        pageURL: `https://gelbooru.com/index.php?page=post&s=view&id=${thisImage.$.id}`
      });
    }
    return JSON.stringify(frontData);
}




app.get('/api/images/:service/', (req, res) => {
  console.log(`Recieved image GET request for ${req.query.tags}`);

  let url = '';
  if(req.params.service == "gelbooru"){
    url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&limit=100&tags=${req.query.tags}`
  }

  
  fetch(url)
  .then( (Data) => {return Data.text()} )
  .then((Data) => {
    parseString(Data, (err, result) => {
      var parsedData = parseGelbooru(result)
      res.send(parsedData)
    })
  })


});

app.listen(port, () => console.log(`Listening on port ${port}`));
