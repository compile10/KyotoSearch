import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";

import { Pagination, Tagbar } from './Navigation';
import Eclipse from './Eclipse';
import convertToURI, {convertToTyped} from './Helper'

import './App.css';



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




class Thumbgrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      imageArray: [], 
      totalImages: 0,
    }
    this.setTotalImages = this.props.setTotalImages.bind(this)
    this.getImages = this.getImages.bind(this)

    this.setUpdate = this.props.setUpdate.bind(this)
    this.setGridLoaded = this.props.setGridLoaded.bind(this)
    this.setMissingState = this.props.setMissingState.bind(this)
  }

  getImages(serviceName, unescapedTags, page){
    this.setGridLoaded(false)
    this.setState({
      loading: true
    })
    var tags = convertToURI(unescapedTags)
    const Url = `/api/images/${serviceName}/?tags=${tags}&page=${page}`
    
    console.log("Calling GET request.")

    return fetch(Url)
      .then(stream =>  stream.json())
      .then(data => {
        console.log(`Loaded data for ${unescapedTags}`)
        return data
      })
      .then(data => {
        
        this.setState({
          loading: false,
          totalImages: data.totalImages,
          imageArray: data.imageArray
        })
        this.setTotalImages(data.totalImages)
        this.setGridLoaded(true)
      })
  }

  componentDidMount(){
    this.setUpdate(false)

    const params = new URLSearchParams(this.props.location.search) //?tags=tag1+tag2+...
    let tags = params.get("tags")
    let page = parseInt(params.get("page"),10)

    //gets the title using the url
    const titleTags = tags.replace(/\+/g , ' ');

    document.title = `${titleTags} - waifuSearch`

    //checks if Thumbgrid was loaded in without data. If it was, then grab data from url. If page property is missing then default to page 1.
    
    if(this.props.tags === ''){ 
      
      if(page === null)
      {
        page = 1
      }
      this.setMissingState(convertToTyped(tags),page)
      this.getImages("gelbooru",tags, page)
    }
    else{
      this.getImages(this.props.service,this.props.tags, this.props.page)
    }
  }
 
 componentDidUpdate(){
 
    if(this.props.update === true){
      document.title = `${this.props.tags} - waifuSearch`
      this.setUpdate(false)
      this.getImages(this.props.service, this.props.tags, this.props.page)
    }
 }
 render() {
   
  if(this.state.loading === true){
    const eclipseContainer = {
      textAlign: "center",
      marginTop: "80px"
    }
    return(
      <div style={eclipseContainer}>  <Eclipse/> </div>
    )
  }
  else{
    let thumbRows = [];

    for( let i = 0; i < this.state.imageArray.length; i++){
        thumbRows.push( <Thumbnail index={i} imageData={this.state.imageArray[i]} key={i}/> )
    }

    return(   
    <div className="row align-items-center" >    
      {thumbRows}
    </div>
  )
  }
 }
}





//TODO: update navbar with URL
//TODO: add error code for bad URLS (with redirect in grid?)
//TODO: rewrite search so it updates the page

class App extends Component{
  constructor(props){
    super(props);
    this.state = {
      totalImages: 0,
      update: false,
      service: 'gelbooru',
      currentPage: 1,
      tags: '',
      gridLoaded: false
    }
  }
  onClick(inTags, inPage){
    this.setState(
      {
        tags: inTags,
        currentPage: inPage,
        update: true
      }
    )
  }

  setGridLoaded(inLoaded){
    this.setState({gridLoaded: inLoaded})
  }

  //fix variable names
  setTotalImages(inTotalImages){
    this.setState({totalImages: inTotalImages})
  }

  setUpdate(inUpdate){
    this.setState({update: inUpdate})
  }
  
  setMissingState(inTags, inPage){
    this.setState({
      tags: inTags,
      currentPage: inPage
    })
  }


  render(){
  
    const thumbgrid = {
      padding: "50px 0 45px 0"
    }
    const paginationStyle = {
      paddingBottom: "30px"
    }
    
  
    
    return(
    <Router>
      <div>
        <div className="container">
          <Tagbar service={this.state.service} onClick={(tag, page) => this.onClick(tag, page)}/> 
        </div>
        <div className="container-fluid gridStyle">        
          
          <Route path="/s/:service" render={({ location }) => { 
            return(
            <div>
              <div style={thumbgrid}> 
                <Thumbgrid imageData={this.state.imageData} update={this.state.update} service={this.state.service} setTotalImages={(x) => this.setTotalImages(x)} 
                page={this.state.currentPage} tags={this.state.tags} setMissingState={(x,y) => this.setMissingState(x,y)} setGridLoaded={x => this.setGridLoaded(x)} setUpdate={x => this.setUpdate(x)} location={location}/> 
              </div> 

              { this.state.gridLoaded && <div style={paginationStyle}> 
                <Pagination totalImages={this.state.totalImages}  tags={this.state.tags} service={this.state.service}
                onClick={(tags, page) => this.onClick(tags, page)}  currentPage={this.state.currentPage} /> 
              </div> }
            </div> 
            )
           }}/>

          <Route exact path="/" render={() => {
            return(
              <div>
               <h1> Enter tags to search for images. </h1>
            </div>
            )
          }
          } />

        </div>
      </div>
    </Router>
    )
  }

}

export default App;
