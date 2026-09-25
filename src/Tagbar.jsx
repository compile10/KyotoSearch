import React, { useState } from 'react';
import { useHistory } from "react-router-dom";
import convertToURI, {convertToTyped, capitalize, isValidSource, source} from './Helper'

//Reads the initial search text from the ?tags= query param
function getInitialTags(){
  const params = new URLSearchParams(window.location.search)
  const tags = params.get("tags")
  return tags ? convertToTyped(tags) : ''
}

//Reads the initial source from a /s/:source/ path, falling back to Danbooru if it isn't a known source
function getInitialSource(){
  const paths = window.location.pathname.split('/')
  const pathSource = paths.length === 4 ? paths[2] : null
  return isValidSource(pathSource) ? pathSource : source.DANBOORU
}

//TODO: add handling for blank search
function Tagbar({ onSearch }){
  const [inputValue, setInputValue] = useState(getInitialTags)
  const [currentSource, setCurrentSource] = useState(getInitialSource)
  const history = useHistory()

  //Runs from both the Search button and pressing enter in the input
  function handleSubmit(event){
    event.preventDefault()
    onSearch(inputValue, currentSource)
    history.push(`/s/${currentSource}/?tags=${convertToURI(inputValue)}&page=1`)
  }

  return(
    <div className="Tagbar" >
      <form className="row justify-content-center" onSubmit={handleSubmit}>
        <div className ="col-lg-4 col-md-5 col-12">
          <input type="text" className="form-control" placeholder="Search Tags" value={inputValue} onChange={(event) => setInputValue(event.target.value)} />
        </div>

        <div className="col-auto">
          <Dropdown source={currentSource} setSource={setCurrentSource}/>
          <button type="submit" style={{marginLeft: "12px"}} className=" d-inline btn btn-primary" >Search</button>
        </div>
      </form>
    </div>
  )
}


function Dropdown(props){

  //Gets the dropdown list by iterating over the lookup function and puts each in a dropdown array
  let dropdownOptions = []
  for(let s in source ){
      dropdownOptions.push(
        <button type="button" key={source[s]} className={"dropdown-item" + (props.source === source[s] ? " active" : "")} onClick={() => props.setSource(source[s])} >{capitalize(source[s])}</button>
      )
    }


  return(
    <div className="d-inline">
    <button className="btn btn-secondary  dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle='dropdown'>
      Sources
    </button>
      <div className="dropdown-menu">
      {dropdownOptions}
    </div>
    </div>
  )

}

export default Tagbar;
