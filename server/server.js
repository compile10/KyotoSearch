const fetch = require('node-fetch');
const express = require('express');
const parseString = require('xml2js').parseString;


const app = express();
const port = process.env.PORT || 4999;


// Add user agent header for requests that need it
const userAgent = 'Mozilla/5.0';
const requestOptions = {
  method: 'GET', 
  headers: {
    'User-Agent': userAgent,
  },
};


//expects service to be a string with the name of the service, tags to be the tags with '+' seperating them, and page to be the page number starting at 1
app.get('/api/images/:service/', (req, res) => { 
  console.log(`Recieved image GET request for ${req.query.tags} on page ${req.query.page} for service ${req.params.service}`);

  let url = '';

  switch(req.params.service){
    case 'gelbooru':
      fetchNewGelbooru(req.query.tags, req.query.page -1, res, "gelbooru.com", parseGelbooru)
      break;
    case 'danbooru':
      fetchDanbooru(req.query.tags, req.query.page - 1, res, "danbooru.donmai.us", "Danbooru")
      break;
    case 'safebooru':
      fetchGelbooru(req.query.tags, req.query.page - 1, res, "safebooru.org", parseSafebooru)
      break; 
    case 'konachan':
      fetchMoebooru(req.query.tags, req.query.page - 1, res, "konachan.com", parseKonachan)
      break;
    }
});
 


function parseGelbooru(data, postCount){
  let images = data.map( thisImage => {
    return { 
      thumbURL: thisImage.preview_url,
      pageURL: `https://gelbooru.com/index.php?page=post&s=view&id=${thisImage.id}`
    };
  })

  parsedResult = {
      totalImages: postCount,
      imageArray: images
  }
  
  return parsedResult;
}


function parseSafebooru(data, postCount){
  let images = data.map( thisImage => {
    let IMGname = thisImage.image.split(".")[0]
    return { 
      thumbURL: `https://safebooru.org/thumbnails/${thisImage.directory}/thumbnail_${IMGname}.jpg`,
      pageURL: `https://safebooru.org/index.php?page=post&s=view&id=${thisImage.id}`
    };
  })


  parsedResult = {
      totalImages: postCount,
      imageArray: images
  }
  
  return parsedResult;
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



function parseKonachan(data, postCount, domain){
  let images = [];
  for(let thisImage of data){
    images.push({ 
      thumbURL: thisImage.preview_url,
      pageURL: `https://${domain}/post/show/${thisImage.id}`
    });
  }
  parsedResult = {
      totalImages: postCount,
      imageArray: images
  }
  return parsedResult;
}

//TODO: Fix posts limit (?)
function fetchDanbooru(tags, offset, res, domain, service){
  let urls = []
  for(let i = 1; i <= 5; i++){
    urls.push(`https://${domain}/posts.json?tags=${tags}&page=${i + (4 * offset)}`)
  }

  let dataArray = []
  
 
  const grabContent = url => fetch(url, requestOptions)
      .then(console.log(url))
      .then(res => res.json())


  Promise
      .all(urls.map(grabContent))
      .then(arrays => arrays.map(array => dataArray.push(...array)) )
      .then(() => console.log(`${service} URL Array for ${tags} fetched`))
      .then(() => fetch(`https://${domain}/counts/posts.json?tags=${tags}`, requestOptions)) 
      .then(result => result.json())
      .then(result => parseDanbooru(dataArray, result.counts.posts, domain))
      .then(parsedResult => {
        if(parsedResult.totalImages === 0){
          console.log(`Search not found for ${tags}.`)
          const noResult = {
            totalImages: 0
          }
          res.send(noResult)
        }
        else{
          res.send(parsedResult)
        }
      })
  }
    

function fetchGelbooru(tags, offset, res, domain, parser ){
  let urls = []
  for(let i = 0; i <= 4; i++){ 
    urls.push(`https://${domain}/index.php?page=dapi&s=post&q=index&limit=20&tags=${tags}&json=1&pid=${i + (5 * offset)}`)
  }

  const grabContent = url => fetch(url)
  .then(res => res.json())

  let dataArray = []

  Promise
  .all(urls.map(grabContent))
  .then(arrays => arrays.map(array => dataArray.push(...array)) )
  .catch((error) => {console.log(`Search not found for ${tags} `)})
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
        var parsedResult = parser(dataArray, result.posts.$.count)
        res.send(parsedResult)
      }
    })
  })
}


function fetchNewGelbooru(tags, offset, res, domain, parser ){
  let urls = []
  for(let i = 0; i <= 4; i++){ 
    urls.push(`https://${domain}/index.php?page=dapi&s=post&q=index&limit=20&tags=${tags}&json=1&pid=${i + (5 * offset)}`)
  }

  const grabContent = url => fetch(url)
  .then(res => res.json())

  let dataArray = []

  Promise
  .all(urls.map(grabContent))
  .then(arrays => arrays.map(array => dataArray.push(...array.post)) )
  .catch((error) => {console.log(`Search not found for ${tags} `)})
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
        var parsedResult = parser(dataArray, result.posts.$.count)
        res.send(parsedResult)
      }
    })
  })
}





function fetchMoebooru(tags, offset, res, domain, parser){
  let urls = []
  for(let i = 1; i <= 5; i++){
    urls.push(`https://${domain}/post.json?tags=${tags}&page=${i + (4 * offset)}`)
  }

  let dataArray = []
  
 
  const grabContent = url => fetch(url)
      .then(res => res.json())

  Promise
  .all(urls.map(grabContent))
  .then(arrays => arrays.map(array => dataArray.push(...array)) )
  .catch(() => console.log(`Eror in moebooru fetch.`))
  .then(() => fetch(`https://${domain}/post.xml?tags=${tags}&limit=0`) )
  .then((result) => result.text())
  .then((xmlresult) => {
    parseString(xmlresult, (err, result) => {
      
      if(result.posts.$.count === "0"){
        console.log(`Search not found for ${tags}.`)
        const noResult = {
          totalImages: 0
        }
        res.send(noResult)
      }
      else{
        var parsedResult = parser(dataArray, result.posts.$.count, domain)
        res.send(parsedResult)
      }
    })
  })
}


app.listen(port, () => console.log(`Listening on port ${port}`));

