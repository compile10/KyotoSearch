const fetch = require('node-fetch');
const express = require('express');
const parseString = require('xml2js').parseString;


const app = express();
const port = process.env.PORT || 5000;




function parseGelbooru(data){
    let images = [];
    for(let thisImage of data.posts.post){
      images.push({ 
        thumbURL: thisImage.$.preview_url,
        pageURL: `https://gelbooru.com/index.php?page=post&s=view&id=${thisImage.$.id}`
      });
    }
    parsedResult = {
        totalImages: data.posts.$.count,
        imageArray: images
    }
    return JSON.stringify(parsedResult);
}



//expects service to be a string with the name of the service, tags to be the tags with '+' seperating them, and page to be the page number starting at 1
app.get('/api/images/:service/', (req, res) => { 
  console.log(`Recieved image GET request for ${req.query.tags}`);

  let url = '';
  if(req.params.service == "gelbooru"){ 
    url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&limit=100&tags=${req.query.tags}&pid=${req.query.page - 1}`
  }

  
  fetch(url)
  .then( (Data) => {return Data.text()} )
  .catch(() => {console.log(`Failed to fetch ${req.query.tags} on page ${req.query.page - 1}`)})
  .then((Data) => {
    parseString(Data, (err, result) => {
      var parsedResult = parseGelbooru(result)
      res.send(parsedResult)
    })
  })


});

app.listen(port, () => console.log(`Listening on port ${port}`));
