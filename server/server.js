const fetch = require('node-fetch');
const express = require('express');
const parseString = require('xml2js').parseString;


const app = express();
const port = process.env.PORT || 5000;


//expects service to be a string with the name of the service, tags to be the tags with '+' seperating them, and page to be the page number starting at 1
app.get('/api/images/:service/', (req, res) => { 
  console.log(`Recieved image GET request for ${req.query.tags} on page ${req.query.page} for service ${req.params.service}`);

  let url = '';

  switch(req.params.service){
    case '0':
      fetchGelbooru(req.query.tags, req.query.page -1, res, "gelbooru.com", "Gelbooru")
      break;
    case '1':
      fetchDanbooru(req.query.tags, req.query.page - 1, res, "danbooru.donmai.us", "Danbooru")
      break;
    case '2':
      fetchDanbooru(req.query.tags, req.query.page - 1, res, "safebooru.org", "Safebooru")
      break; 
    }
});
 


function parseGelbooru(data, postCount, domain){
  let images = data.map( thisImage => {
    return { 
      thumbURL: `https://simg3.${domain}/thumbnails/${thisImage.directory}/thumbnail_${thisImage.hash}.jpg`,
      pageURL: `https://${domain}/index.php?page=post&s=view&id=${thisImage.id}`
    };
  })

  //let snip = xmlresult.slice(xmlresult.search("count="), xmlresult.search("offset="))
  //snip = snip.slice(7, snip.length-2)
  

  parsedResult = {
      totalImages: postCount,
      imageArray: images
  }
  
  return parsedResult;
}




function fetchGelbooru(tags, offset, res, domain, service ){
  let urls = []
  for(let i = 0; i <= 4; i++){ 
    urls.push(`https://${domain}/index.php?page=dapi&s=post&q=index&limit=20&tags=${tags}&json=1&pid=${i + (4 * offset)}`)
  }

  const grabContent = url => fetch(url)
  .then(res => res.json())

  let dataArray = []

  Promise
  .all(urls.map(grabContent))
  .then(arrays => arrays.map(array => dataArray.push(...array)) )
  .then(() => fetch(`https://${domain}/index.php?page=dapi&s=post&q=index&limit=0&tags=${tags}&json=0&pid=0`) )
  .then((result) => result.text())
  .then((xmlresult) => {
    parseString(xmlresult, (err, result) => {
      
      if(result.posts.$.count === "0"){
        const noResult = {
          totalImages: 0
        }
        res.send(noResult)
      }
      else{
        var parsedResult = parseGelbooru(dataArray, result.posts.$.count, domain)
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
      .then(arrays => arrays.map(array => dataArray.push(...array)) )
      .then(() => console.log(`${service} URL Array for ${tags} fetched`))
      .then(() => fetch(`https://${domain}/counts/posts.json?tags=${tags}`)) 
      .then(result => result.json())
      .then(result => parseDanbooru(dataArray, result.counts.posts, domain))
      .then(parsedResult => res.send(parsedResult))
}


app.listen(port, () => console.log(`Listening on port ${port}`));
