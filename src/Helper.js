

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
    const sources = ["gelbooru", "danbooru"]
    return sources[code]
}

function lookupCode(text){
    const codes = {
        "gelbooru": 1,
        "danbooru": 2
    }
    return codes[text]
}


export {convertToTyped, lookupSources, lookupCode, convertToURI}
export default convertToURI