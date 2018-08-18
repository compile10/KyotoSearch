
function convertToURI(unescapedTags){
    var tags = escape(unescapedTags)
    tags = tags.replace(/ /g , "+");
    return tags
}

export default convertToURI