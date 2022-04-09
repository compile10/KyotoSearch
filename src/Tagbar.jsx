import React, { Component } from 'react';
import { Redirect } from "react-router-dom";
import convertToURI, {convertToTyped,capitalize, source} from './Helper'

  //TODO: add handling for blank search 
  class Tagbar extends Component{
    constructor(props){
      super(props)
      this.state = {
        inputvalue: '',
        click: false,
        source: source.GELBOORU
      };

      this.handleClick = this.handleClick.bind(this)
      this.handleChange = this.handleChange.bind(this)
      this.enterKey = this.enterKey.bind(this)
    }
    setInputvalue(input){
      this.setState({inputvalue: input})
    }

    handleChange(event){
      this.setState({
        inputvalue: event.target.value,
      })
    }
    
    handleClick(){
      let page = 1
      this.props.onClick(this.state.inputvalue, page, this.state.source) 
      this.setState({click: true})
    }

    setSource(thisSource){
      this.setState({source: thisSource})
    }
  
    //executes if the user hits the enter key
    enterKey(event){
      if (event.target.type !== 'textarea' && event.which === 13 /* Enter */) {
        event.preventDefault();
        this.handleClick()
      
  }
    }
    componentDidUpdate(){
      if(this.state.click === true){
        this.setState({click: false})
      }
    }

    componentDidMount(){
      const params = new URLSearchParams(window.location.search)
      if(params.get("tags") !== null){
        const searchText = convertToTyped(params.get("tags"))
        this.setState({inputvalue: searchText})
      }
      const paths = window.location.pathname.split('/')
      if(paths.length === 4 && paths[2] !== source.GELBOORU){
        this.setState({ source: paths[2] })
        
      }
      
    }
  
    render(){
        return(
          <div className="Tagbar" >
          <div className="row justify-content-center">
            <div className ="col-lg-4 col-md-5 col-12">
            <form>
              <input type="text" className="form-control" placeholder="Search Tags" value={this.state.inputvalue} onChange={this.handleChange } onKeyPress={this.enterKey} />
            </form>
            </div>
             
            <div className="col-auto">
              <Dropdown source={this.state.source} setSource={(x) => this.setSource(x)}/>  
              <button type="button" style={{marginLeft: "12px"}} className=" d-inline btn btn-primary" onClick={this.handleClick} >Search</button>
            </div>
            </div>
            { this.state.click && <Redirect to={`/s/${this.state.source}/?tags=${convertToURI(this.state.inputvalue)}&page=1`} /> }
          </div>
        )
    }
  }
  

function Dropdown(props){

  //Gets the dropdown list by iterating over the lookup function and puts each in a dropdown array
  let dropdownOptions = []
  for(let s in source ){
      dropdownOptions.push(
        <button key={source[s]} className={"dropdown-item" + (props.source === source[s] ? " active" : "")} onClick={() => props.setSource(source[s])} >{capitalize(source[s])}</button>
      )
    }
  
  
  return(
    <div className="d-inline">
    <button className="btn btn-secondary  dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown">
      Sources
    </button>
      <div className="dropdown-menu">
      {dropdownOptions}
    </div>
    </div>
  )

}

export default Tagbar;