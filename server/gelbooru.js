const fetch = require('node-fetch')

const GELBOORU_DOMAIN = 'gelbooru.com'
const PAGE_SIZE = 100
const REQUEST_OPTIONS = {
  method: 'GET',
  headers: {
    'User-Agent': 'KyotoSearch/1.0'
  }
}

class GelbooruError extends Error {
  constructor(message, statusCode = 502) {
    super(message)
    this.name = 'GelbooruError'
    this.statusCode = statusCode
  }
}

function getCredentials() {
  const apiKey = process.env.GELBOORU_API_KEY?.trim()
  const userId = process.env.GELBOORU_USER_ID?.trim()

  if(!apiKey || !userId) {
    throw new GelbooruError(
      'Gelbooru search requires GELBOORU_API_KEY and GELBOORU_USER_ID on the server.',
      503
    )
  }

  return { apiKey, userId }
}

function buildSearchUrl(tags, pageIndex, credentials) {
  const url = new URL(`https://${GELBOORU_DOMAIN}/index.php`)
  url.searchParams.set('page', 'dapi')
  url.searchParams.set('s', 'post')
  url.searchParams.set('q', 'index')
  url.searchParams.set('json', '1')
  url.searchParams.set('limit', PAGE_SIZE.toString())
  url.searchParams.set('pid', pageIndex.toString())
  url.searchParams.set('tags', tags)
  url.searchParams.set('api_key', credentials.apiKey)
  url.searchParams.set('user_id', credentials.userId)
  return url
}

function parseResponse(result) {
  if(!result || result.success === false || result.success === 'false') {
    const message = result?.reason || result?.message || 'Gelbooru could not complete the search.'
    throw new GelbooruError(message)
  }

  const totalImages = Number(result['@attributes']?.count)

  if(!Number.isFinite(totalImages)) {
    throw new GelbooruError('Gelbooru returned an invalid response.')
  }

  if(totalImages === 0 && result.post === undefined) {
    return { totalImages: 0, imageArray: [] }
  }

  const posts = result.post
  if(!Array.isArray(posts)) {
    throw new GelbooruError('Gelbooru returned an invalid response.')
  }

  return {
    totalImages,
    imageArray: posts
      .filter(post => post && post.id != null && post.preview_url)
      .map(post => ({
        thumbURL: post.preview_url,
        pageURL: `https://${GELBOORU_DOMAIN}/index.php?page=post&s=view&id=${post.id}`
      }))
  }
}

async function searchGelbooru(tags, pageIndex) {
  const credentials = getCredentials()
  const url = buildSearchUrl(tags, pageIndex, credentials)
  const response = await fetch(url.toString(), REQUEST_OPTIONS)

  if(!response.ok) {
    if(response.status === 401 || response.status === 403) {
      throw new GelbooruError('Gelbooru rejected the configured API credentials.', 502)
    }
    if(response.status === 429) {
      throw new GelbooruError('Gelbooru is rate-limiting requests. Please try again later.', 503)
    }
    throw new GelbooruError(`Gelbooru returned HTTP ${response.status}.`)
  }

  let result
  try {
    result = await response.json()
  } catch(error) {
    throw new GelbooruError('Gelbooru returned an invalid response.')
  }

  return parseResponse(result)
}

module.exports = {
  GelbooruError,
  searchGelbooru
}
