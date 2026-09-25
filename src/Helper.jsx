const source = {
    GELBOORU: 'gelbooru',
    DANBOORU: 'danbooru',
    SAFEBOORU: 'safebooru',
    KONACHAN: 'konachan'
}

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

function capitalize(s){
    return s.charAt(0).toUpperCase() + s.slice(1)
}

//Checks that a name (e.g. from the URL) is one of the supported sources
function isValidSource(name){
    return Object.values(source).includes(name)
}
  

export {convertToTyped, capitalize, convertToURI, isValidSource, source}
export default convertToURI