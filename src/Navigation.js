import React, { Component } from 'react';
import { Redirect } from "react-router-dom";
import convertToURI, {convertToTyped, lookupSources} from './Helper'



const LEFT_PAGE = -1; 
const RIGHT_PAGE = -2; 

const SOURCES_COUNT = 2;  

class Pagination extends Component{
    constructor(props){
      super(props);
      this.state = {
        click: false
      }
      this.range = this.range.bind(this);
      this.pageNumbers = this.pageNumbers.bind(this);
    }
    range(bottom, top){
      let range = []
      for(let i = bottom; i <= top; i++ ){
        range.push(i);
      }
      return range; 
    }
    pageNumbers(currentPage, totalPages){
      let leftOverflow = true
      let rightOverflow = true
  
      if(currentPage <= 3){
        leftOverflow = false
      }
      if(currentPage > totalPages - 3){
        rightOverflow = false
      }
  
      if(totalPages <= 7 ){
        rightOverflow = false
        leftOverflow = false
      }
  
      let pageNums = []
  
      switch(true){
        case (leftOverflow && rightOverflow):
          pageNums.push(LEFT_PAGE)
          pageNums = pageNums.concat(this.range(currentPage - 3, currentPage + 3))   
          pageNums.push(RIGHT_PAGE)
          break; 
        case (!leftOverflow && rightOverflow):
          pageNums = this.range(1,7)
          pageNums.push(RIGHT_PAGE)
          break;
        case (leftOverflow && !rightOverflow):
          pageNums.push(LEFT_PAGE) 
          pageNums = pageNums.concat(this.range(totalPages - 7, totalPages)); 
          break;
        default:
          pageNums = this.range(1,totalPages)
      }
  
      return pageNums; 
    }
    componentDidUpdate(){
      if(this.state.click === true){
        this.setState({click: false})
      }
    }

    render(){
    
      let totalPages = Math.floor(this.props.totalImages/100);
      totalPages = this.props.totalImages % 100 !== 0 ? totalPages + 1 : totalPages;
      let pageNums = this.pageNumbers(this.props.currentPage, totalPages)

      const paginationArray = pageNums.map( (i) => {
        switch(i){
          case this.props.currentPage:
            return (
              <li className="page-item active" key={i}>
                <button type="button"  className="page-link" onClick={() => {this.props.onClick(this.props.tags, i); this.setState({click: true})}}> {i} </button>
              </li>
            )
          
          case LEFT_PAGE:
            return(
              <li className="page-item" key={LEFT_PAGE}>
                <button type="button" className="page-link" onClick={() => {this.props.onClick(this.props.tags, 1); this.setState({click: true})}}>&laquo; </button>
              </li>
            )
          
          case RIGHT_PAGE:
            return(
              <li className="page-item" key={RIGHT_PAGE}>
                <button type="button" className="page-link" onClick={() => {this.props.onClick(this.props.tags, totalPages); this.setState({click: true})}} > &raquo; </button>
              </li>
            )
           
          default: 
            return(
              <li className="page-item" key={i}> 
                <button type="button" className="page-link" onClick={() => {this.props.onClick(this.props.tags, i); this.setState({click: true})}}>{i}</button> 
              </li>
            )
      }
      })
    
      return(
        <div className="row justify-content-center">
          <div className="col-lg-2 d-flex col-md-5 col-sm-8">
            <ul className="pagination mx-auto">
              {paginationArray}
            </ul>
          </div>
          { this.state.click && <Redirect to={`/s/${lookupSources(this.props.source).toLowerCase()}/?tags=${convertToURI(this.props.tags)}&page=${this.props.currentPage}`} /> }
        </div>
      )
    }
  
  }
  
  
  
  //TODO: add handling for blank search 
  class Tagbar extends Component{
    constructor(props){
      super(props)
      this.state = {
        inputvalue: '',
        click: false,
        source: 0,
      }
      this.handleChange = this.handleChange.bind(this);
      this.enterKey = this.enterKey.bind(this);
    }
    setInputvalue(input){
      this.setState({inputvalue: input})
    }

    handleChange(event){
      this.setState({
        inputvalue: event.target.value,
      })
    }

    setSource(thisSource){
      this.setState({source: thisSource})
    }
  
    enterKey(event){
      if (event.target.type !== 'textarea' && event.which === 13 /* Enter */) {
        event.preventDefault();
        this.props.onClick(this.state.inputvalue, 1); 
        this.setState({click: true})
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
              <button type="button" style={{marginLeft: "12px"}} className=" d-inline btn btn-primary" onClick={() => {this.props.onClick(this.state.inputvalue, 1, this.state.source); this.setState({ click: true}) }} >Search</button>
            </div>
            </div>
            { this.state.click && <Redirect to={`/s/${lookupSources(this.state.source).toLocaleLowerCase()}/?tags=${convertToURI(this.state.inputvalue)}&page=1`} /> }
          </div>
        )
    }
  }
  

class Dropdown extends Component{
  constructor(props){
    super(props)
  }



  render(){
    let dropdownOptions = []
    for(let i = 0; i < SOURCES_COUNT; i++ ){
        dropdownOptions.push(
          <button className={"dropdown-item" + (this.props.source === i ? " active" : "")} onClick={() => this.props.setSource(i)} >{lookupSources(i)}</button>
        )
      }
    

    return(
      <div className="d-inline">
      <button class="btn btn-secondary  dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown">
        Sources
      </button>
       <div class="dropdown-menu">
        {dropdownOptions}
      </div>
      </div>
    )
  }
}



  export {Tagbar, Pagination}