const fetch = require('node-fetch');
const express = require('express');
const parseString = require('xml2js').parseString;
const path = require('path');


const app = express();
const port = process.env.PORT || 4999;


// Add user agent header for requests that need it
const userAgent = 'KyotoSearch/1.0';
const requestOptions = {
  method: 'GET', 
  headers: {
    'User-Agent': userAgent,
  },
};

app.use(express.static(path.join(__dirname, '..', 'dist')));

//expects service to be a string with the name of the service, tags to be the tags with '+' seperating them, and page to be the page number starting at 1
app.get('/api/images/:service/', (req, res) => { 
  console.log(`Recieved image GET request for ${req.query.tags} on page ${req.query.page} for service ${req.params.service}`);

  let url = '';
  try {
  switch(req.params.service){
      case 'gelbooru':
        fetchNewGelbooru(req.query.tags, req.query.page - 1, res, "gelbooru.com", parseGelbooru)
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
  } catch (error) {
    console.log(`Error fetching images from ${req.params.service} API: ${error}`);
  }
});

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'), err => {
      if (err) {
          console.log(err);
      }
  });
});


function parseGelbooru(data, postCount){
  let images = data.map( thisImage => {
    return { 
      thumbURL: thisImage.preview_url,
      pageURL: `https://gelbooru.com/index.php?page=post&s=view&id=${thisImage.id}`
    };
  })

  const parsedResult = {
      totalImages: parseInt(postCount, 10),
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
      .then(res => res.json())


  Promise
      .all(urls.map(grabContent))
      .then(arrays => arrays.map(array => dataArray.push(...array)) )
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


async function fetchNewGelbooru(tags, offset, res, domain, parser ){
  const url = new URL(`https://${domain}/index.php`)
  url.searchParams.set('page', 'dapi')
  url.searchParams.set('s', 'post')
  url.searchParams.set('q', 'index')
  url.searchParams.set('limit', '100')
  url.searchParams.set('tags', tags)
  url.searchParams.set('json', '1')
  url.searchParams.set('pid', offset.toString())

  const apiKey = process.env.GELBOORU_API_KEY
  const userId = process.env.GELBOORU_USER_ID
  if(apiKey && userId){
    url.searchParams.set('api_key', apiKey)
    url.searchParams.set('user_id', userId)
  }

  try {
    const response = await fetch(url.toString(), requestOptions)
    if(!response.ok){
      let message = `Gelbooru returned HTTP ${response.status}.`
      if(response.status === 401){
        message = apiKey && userId
          ? 'Gelbooru rejected the configured API credentials.'
          : 'Gelbooru search requires GELBOORU_API_KEY and GELBOORU_USER_ID on the server.'
      }
      console.log(`Error fetching Gelbooru images: ${message}`)
      return res.status(response.status === 401 && !(apiKey && userId) ? 503 : 502).json({ error: message })
    }

    const result = await response.json()
    if(result.success === false){
      const message = result.reason || result.message || 'Gelbooru could not complete the search.'
      console.log(`Error fetching Gelbooru images: ${message}`)
      return res.status(502).json({ error: message })
    }

    // Gelbooru's current JSON response wraps posts and result metadata in an object.
    // Keep accepting the legacy top-level array so older compatible deployments work too.
    const posts = Array.isArray(result) ? result : (Array.isArray(result.post) ? result.post : [])
    const rawCount = result['@attributes'] && result['@attributes'].count
    const postCount = Number.isFinite(Number(rawCount)) ? Number(rawCount) : posts.length

    if(postCount === 0){
      return res.json({ totalImages: 0, imageArray: [] })
    }

    return res.json(parser(posts, postCount))
  } catch(error) {
    console.log(`Error fetching images from Gelbooru API: ${error.message}`)
    return res.status(502).json({ error: 'Unable to reach Gelbooru. Please try again later.' })
  }
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
