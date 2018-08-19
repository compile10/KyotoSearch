
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

export {convertToTyped, convertToURI}
export default convertToURI