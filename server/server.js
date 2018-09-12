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
        totalImages: parseInt(data.posts.$.count),
        imageArray: images
    }
    return parsedResult;
}



//expects service to be a string with the name of the service, tags to be the tags with '+' seperating them, and page to be the page number starting at 1
app.get('/api/images/:service/', (req, res) => { 
  console.log(`Recieved image GET request for ${req.query.tags} on page ${req.query.page} for service ${req.params.service}`);

  let url = '';
  if(req.params.service === '0'){ 
    
  }
  switch(req.params.service){
    case '0':
      url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&limit=100&tags=${req.query.tags}&pid=${req.query.page - 1}`
      fetch(url)
      .then( res => res.text() )
      .catch(() => {console.log(`Failed to fetch ${req.query.tags} on page ${req.query.page} for service ${req.params.service}`)})
      .then((Data) => {
        parseString(Data, (err, result) => {
          if(result.posts.$.count === "0"){
            const noResult = {
              totalImages: 0
            }
            res.send(noResult)
          }
          else{
            var parsedResult = parseGelbooru(result)
            res.send(parsedResult)
          }
        })
      })
      break;
    case '1':
      fetchDanbooru(req.query.tags, req.query.page - 1, res, "danbooru.donmai.us", "Danbooru")
      break;
    case '2':
      fetchDanbooru(req.query.tags, req.query.page - 1, res, "safebooru.org", "Safebooru")
      break; 
    }
});
  
  
function parseGelbooru(tags, offset, res, domain, service ){
  let urls = []
  for(let i = 1; i <= 5; i++){
    urls.push(`https://${domain}/index.php?page=dapi&s=post&q=index&limit=20&tags=${tags}&pid=${i + (4 * offset)}`)
  }
  fetch(url)
  .then( res => res.text() )
  .catch(() => {console.log(`Failed to fetch ${req.query.tags} on page ${offset + 1} for service ${service}`)})
  .then((Data) => {
    parseString(Data, (err, result) => {
      if(result.posts.$.count === "0"){
        const noResult = {
          totalImages: 0
        }
        res.send(noResult)
      }
      else{
        var parsedResult = parseGelbooru(result)
        res.send(parsedResult)
      }
    })
  })
}



function parseDanbooru(data, postCount, domain){
  let images = [];
  for(let thisImage of data){
    images.push({ 
      thumbURL: thisImage.preview_file_url,
      pageURL: `https://${domain}/posts/${thisImage.id}`
    });
  }
  parsedResult = {
      totalImages: parseInt(postCount),
      imageArray: images
  }
  return parsedResult;
}



function fetchDanbooru(tags, offset, res, domain, service){
  let urls = []
  for(let i = 1; i <= 5; i++){
    urls.push(`https://${domain}/posts.json?tags=${tags}&page=${i + (4 * offset)}`)
  }

  let dataArray = []
  
 
  const grabContent = url => fetch(url)
      .then(res => res.json())


  Promise
      .all(urls.map(grabContent))
      .then((arrays) => arrays.map(array => dataArray.push(...array)) )
      .then(() => console.log(`${service} URL Array for ${tags} fetched`))
      .then(() => fetch(`https://${domain}/counts/posts.json?tags=${tags}`)) 
      .then(res => res.json())
      .then(res => parseDanbooru(dataArray, res.counts.posts, domain))
      .then(parsedResult => res.send(parsedResult))
}


app.listen(port, () => console.log(`Listening on port ${port}`));
