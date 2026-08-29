const fetch = require('node-fetch')

const GELBOORU_DOMAIN = 'gelbooru.com'
const GELBOORU_REFERER = `https://${GELBOORU_DOMAIN}/`
const GELBOORU_THUMBNAIL_ROUTE = '/api/images/gelbooru/thumbnail'
const GELBOORU_CDN_PATTERN = /^img([1-9]\d{0,2})\.gelbooru\.com$/
const GELBOORU_THUMBNAIL_PATTERN = /^\/thumbnails\/([0-9a-f]{2})\/([0-9a-f]{2})\/thumbnail_([0-9a-f]{32})\.(jpe?g|png|gif|webp)$/i
const GELBOORU_THUMBNAIL_ID_PATTERN = /^([0-9a-f]{32})\.(jpe?g|png|gif|webp)$/i
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

function parseThumbnailUrl(value) {
  if(typeof value !== 'string') {
    throw new GelbooruError('Gelbooru returned an invalid thumbnail URL.')
  }

  let url
  try {
    url = new URL(value)
  } catch(error) {
    throw new GelbooruError('Gelbooru returned an invalid thumbnail URL.')
  }

  const cdnMatch = url.hostname.match(GELBOORU_CDN_PATTERN)
  const thumbnailMatch = url.pathname.match(GELBOORU_THUMBNAIL_PATTERN)

  if(url.protocol !== 'https:' || url.port || url.username || url.password
    || url.search || url.hash || !cdnMatch || !thumbnailMatch) {
    throw new GelbooruError('Gelbooru returned an invalid thumbnail URL.')
  }

  const hash = thumbnailMatch[3].toLowerCase()
  if(thumbnailMatch[1].toLowerCase() !== hash.slice(0, 2)
    || thumbnailMatch[2].toLowerCase() !== hash.slice(2, 4)) {
    throw new GelbooruError('Gelbooru returned an invalid thumbnail URL.')
  }

  return {
    shard: cdnMatch[1],
    thumbnailId: `${hash}.${thumbnailMatch[4].toLowerCase()}`
  }
}

function buildThumbnailProxyUrl(previewUrl) {
  const { shard, thumbnailId } = parseThumbnailUrl(previewUrl)
  return `${GELBOORU_THUMBNAIL_ROUTE}/${shard}/${thumbnailId}`
}

function buildThumbnailCdnUrl(shard, thumbnailId) {
  const thumbnailMatch = typeof thumbnailId === 'string'
    ? thumbnailId.match(GELBOORU_THUMBNAIL_ID_PATTERN)
    : null

  if(typeof shard !== 'string' || !/^[1-9]\d{0,2}$/.test(shard) || !thumbnailMatch) {
    throw new GelbooruError('Invalid Gelbooru thumbnail identifier.', 400)
  }

  const hash = thumbnailMatch[1].toLowerCase()
  const extension = thumbnailMatch[2].toLowerCase()
  return `https://img${shard}.${GELBOORU_DOMAIN}/thumbnails/${hash.slice(0, 2)}/${hash.slice(2, 4)}/thumbnail_${hash}.${extension}`
}

async function fetchGelbooruThumbnail(shard, thumbnailId) {
  const url = buildThumbnailCdnUrl(shard, thumbnailId)
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': REQUEST_OPTIONS.headers['User-Agent'],
      Referer: GELBOORU_REFERER
    },
    // A valid Gelbooru CDN request returns the image directly. Do not follow a
    // hotlink-protection redirect (or any redirect outside the validated host).
    redirect: 'manual'
  })

  if(!response.ok) {
    throw new GelbooruError(`Gelbooru thumbnail returned HTTP ${response.status}.`)
  }

  const contentType = response.headers.get('content-type') || ''
  if(!contentType.toLowerCase().startsWith('image/')) {
    throw new GelbooruError('Gelbooru thumbnail returned an invalid response.')
  }

  return response
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
        thumbURL: buildThumbnailProxyUrl(post.preview_url),
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
  fetchGelbooruThumbnail,
  searchGelbooru
}
