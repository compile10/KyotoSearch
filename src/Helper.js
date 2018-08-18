
function convertToURI(unescapedTags){
    let tags = unescapedTags.replace(/ /g, "+")
    tags = escape(tags)
    
    return tags
}

function convertToTyped(escapedTags){
    let tags = unescape(escapedTags)
    tags = tags.replace(/\+/g, " ")
    
    return tags
}

export {convertToTyped, convertToURI}
export default convertToURI