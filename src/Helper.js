

function convertToURI(unescapedTags){
    let tags = unescapedTags.split(' ')
    let union = ""
    for(let tag of tags){
        if(tag !== ''){
            union = union.concat(tag, "+")
        }
    }

    tags = escape(union.slice(0, union.length-1))
    
    return tags
}

function convertToTyped(escapedTags){
    let tags = unescape(escapedTags)
    tags = tags.replace(/\+/g, " ")
    
    return tags
}

function lookupSources(code){
    const sources = ["Gelbooru", "Danbooru"]
    return sources[code]
}

function lookupCode(text){
    const codes = {
        "gelbooru": 0,
        "danbooru": 1
    }
    return codes[text.toLowerCase()]
}


export {convertToTyped, lookupSources, lookupCode, convertToURI}
export default convertToURI