

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

//take a source id and return its text
function lookupSources(code){
    const sources = ["Gelbooru", "Danbooru", "Safebooru", "Konachan"]
    return sources[code]
}

//take a string with the source name and look up its id. If it does not exist, return -1
function lookupCode(text){
    const codes = {
        "gelbooru": 0,
        "danbooru": 1,
        "safebooru": 2,
        "konachan": 3
    }
    if(codes.hasOwnProperty(text) === false){
        return -1
    }
    return codes[text.toLowerCase()]
}


export {convertToTyped, lookupSources, lookupCode, convertToURI}
export default convertToURI