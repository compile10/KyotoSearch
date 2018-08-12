import React, { Component } from 'react';
import './App.css';
import Eclipse from './Eclipse';

const LEFT_PAGE = -1; 
const RIGHT_PAGE = -2; 

function Thumbnail(props){
    const colStyle = {
      textAlign: "center"
    }
    const aStyle = {
      height: "200px"
    }

    return(
      <div className="col-4 col-sm-3 col-md-2 col-lg-1 col-xl-1 img-lg" style={colStyle}>
        <a className="mb-4 d-block h-100" rel="noreferrer" target="_blank" style={aStyle} href={props.imageData.pageURL} > <img alt="Thumbnail"  className="img-fluid " src={props.imageData.thumbURL}/> </a> 
      </div> 
      
    )
  
}




function Thumbgrid(props){
    let thumbRows = [];
        
    for( let i = 0; i < props.imageData.length; i++){
        thumbRows.push( <Thumbnail service="gelbooru" index={i} imageData={props.imageData[i]} key={i}/> )
    }     

    return(   
     <div className="row  align-items-center" >    
      {thumbRows}
     </div>
    )
  
  }



class Pagination extends Component{
  constructor(props){
    super(props);
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

  render(){
    let totalPages = Math.floor(this.props.totalImages/100);
    totalPages = this.props.totalImages % 100 !== 0 ? totalPages + 1 : totalPages;
    let pageNums = this.pageNumbers(this.props.currentPage, totalPages)

    const paginationArray = pageNums.map( (i) => {
      switch(i){
        case this.props.currentPage:
          return (
            <li className="page-item active" key={i}>
              <button type="button"  className="page-link" onClick={() => this.props.onClick(this.props.tags, i) }> {i} </button>
            </li>
          )
        
        case LEFT_PAGE:
          return(
            <li className="page-item" key={LEFT_PAGE}>
              <button type="button" className="page-link" onClick={() => this.props.onClick(this.props.tags, 1) }>&laquo; </button>
            </li>
          )
        
        case RIGHT_PAGE:
          return(
            <li className="page-item" key={RIGHT_PAGE}>
              <button type="button" className="page-link" onClick={() => this.props.onClick(this.props.tags, totalPages)}> &raquo; </button>
            </li>
          )
         
        default: 
          return(
            <li className="page-item" key={i}> 
              <button type="button" className="page-link" onClick={() => this.props.onClick(this.props.tags, i)}>{i}</button> 
            </li>
          )
    }
    })

    return(
      <div className="row justify-content-center">
        <div className="col-lg-2 col-md-5 col-8">
          <ul className="pagination">
            {paginationArray}
          </ul>
        </div>
      </div>
    )
  }

}




class Tagbar extends Component{
  constructor(props){
    super(props);
    this.state = {
      inputvalue: ''
    }
    this.handleChange = this.handleChange.bind(this);
    this.enterKey = this.enterKey.bind(this);
  }
  handleChange(event){
    this.setState({
      inputvalue: event.target.value,
    })
  }

  enterKey(event){
    if (event.target.type !== 'textarea' && event.which === 13 /* Enter */) {
      event.preventDefault();
      this.props.onClick(this.state.inputvalue, 1); 
}
  }

  render(){
    return(
      <div className="Tagbar" >
       <div className="row justify-content-center">
        <div className ="col-lg-4 col-md-5 col-9">
         <form>
           <input type="text" className="form-control" placeholder="Search Tags" value={this.state.inputvalue} onChange={this.handleChange } onKeyPress={this.enterKey} />
        </form>
        </div>
        <div className="col-lg-1 col-md-1 col-1">
        <button type="button" className="btn btn-primary" onClick={() => this.props.onClick(this.state.inputvalue, 1)}>Search</button>
        </div>
        </div>
      </div>
    )
  }
}



//TODO Add URL properties for tags
class App extends Component{
  constructor(props){
    super(props);
    this.state = {
      imageData: [],
      totalImages: 0,
      service: 'gelbooru',
      currentPage: 1,
      tags: '',
      loading: false
    }

  }

  //TODO: add error handling for bad fetch
  onClick(input, page){
    this.setState({
      tags: input,
      currentPage: page,
      loading: true
    })
    var tag = escape(input)
    tag = tag.replace(/ /g , "+");
    const Url = `/api/images/${this.state.service}/?tags=${tag}&page=${page}`
    
    console.log("Calling GET request.")

    return fetch(Url)
      .then(stream =>  stream.json())
      .then(data => {
        console.log(`Loaded data for ${input}`)
        return data
      })
      .then(data => { this.setState({
          imageData: data.imageArray,
          totalImages: data.totalImages,
          loading: false
      }) })

  }

  render(){
    const hide = {
      display: 'none'
    }
    const show = {
      fontStyle: 'italic',
      textAlign: 'center',
      padding: '60px 0 60px 0',
    }
    const thumbgrid = {
      padding: "50px 0 45px 0"
    }
    const paginationStyle = {
      paddingBottom: "30px"
    }
    const eclipseStyle = {
      textAlign: "center",
      marginTop: "80px"
    }

    let text = 'Enter tags to search for images.'
  
    const loaded = !this.state.loading;

    return(
    <div>
      <div className="container">
        <Tagbar onClick={(tag, page) => this.onClick(tag, page)}/> 
      </div>
      <div className="container-fluid gridStyle">
         <h1 style={this.state.tags === '' ? show : hide}> {text} </h1>
         {this.state.loading && <div style={eclipseStyle}> <Eclipse/> </div>}
         { this.state.imageData.length !== 0 && loaded && <div style={thumbgrid}> <Thumbgrid imageData={this.state.imageData}/> </div> }
         { this.state.totalImages !== 0 && loaded && <div style={paginationStyle}> <Pagination totalImages={this.state.totalImages} tags={this.state.tags} onClick={(tag, page) => this.onClick(tag, page)} currentPage={this.state.currentPage}/> </div>} 
         
      </div>
    </div>
    )
  }

}

export default App;
