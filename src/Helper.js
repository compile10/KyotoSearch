
function convertToURI(unescapedTags){
    let tags = unescapedTags.replace(/ /g , "+");
    tags = escape(tags)
    
    return tags
}

export default convertToURI