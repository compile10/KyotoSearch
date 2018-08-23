import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { Pagination, Tagbar } from './Navigation';
import Eclipse from './Eclipse';
import convertToURI, {convertToTyped} from './Helper'

import 'animate.css/animate.min.css'
import './App.css';



class Thumbnail extends React.Component{
  constructor(props){
    super(props);
    this.imageLoaded = this.props.imageLoaded.bind(this)
    }
  render(){
      const colStyle = {
        textAlign: "center"
      }
      const aStyle = {
        height: "200px"
      }

      return(
        <div className="col-4 col-sm-3 col-md-2 col-lg-1 col-xl-1 img-lg" style={colStyle}>
          <a className="mb-4 d-block h-100" rel="noreferrer" target="_blank" style={aStyle} href={this.props.imageData.pageURL} > 
            <img alt="Thumbnail"  onLoad={() => this.props.imageLoaded()} className="img-fluid animated fadeInUp" src={this.props.imageData.thumbURL}/>
          </a> 
        </div> 
        
      )
  }
}




class Thumbgrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      imageArray: [], 
      totalImages: 0,
      imagesLoaded: 0,
      badTagError: false
    }
    this.setTotalImages = this.props.setTotalImages.bind(this)
    this.getImages = this.getImages.bind(this)

    this.setUpdate = this.props.setUpdate.bind(this)
    this.setGridLoaded = this.props.setGridLoaded.bind(this)
    this.setTags = this.props.setTags.bind(this)
    this.setPage = this.props.setPage.bind(this)
  }

  getImages(serviceName, unescapedTags, page){
    this.setGridLoaded(false)
    this.setState({
      loading: true,
      imageArray: [],
      imagesLoaded: 0
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
        if(data.totalImages === 0){
          this.setState({
            badTagError:true,
            loading: false
          })
        }
        else{
          this.setState({
            badTagError: false,
            totalImages: data.totalImages,
            imageArray: data.imageArray
          })
          this.setTotalImages(data.totalImages)
        } 
      })
  }

    // TODO: add error handling for urls with no query strings
  componentDidMount(){
    this.setUpdate(false)

    const params = new URLSearchParams(this.props.location.search) //?tags=tag1+tag2+...
     


    let tags
    let page
    
    
    if(this.props.page === -1){
      page = params.get("page")
      if(page === null){
        page = 1
      }
      else{
        page = parseInt(page, 10)
      }
      this.setPage(page)
    }
    else{
      page = this.props.page
    }

    if(this.props.tags === ''){
      tags = params.get("tags")
      this.setTags(tags)
    }
    else{
      tags = this.props.tags
    }
    document.title = `${convertToTyped(tags)} - waifuSearch`
    this.getImages("gelbooru", tags, page)

  }

  

 
 componentDidUpdate(){

  if(this.props.update === true){
    document.title = `${this.props.tags} - waifuSearch`
    this.setUpdate(false)
    this.getImages(this.props.service, this.props.tags, this.props.page)
  }

   if(this.state.imagesLoaded === this.state.imageArray.length && this.state.loading === true && this.state.imageArray.length !== 0){
     this.setState({loading: false})
     this.setGridLoaded(true)
   }
 
 }

 imageLoaded(){
   this.setState({imagesLoaded: this.state.imagesLoaded + 1 })
 }

 render() {
  if(this.state.badTagError === true && this.state.loading === false){
    return(<h1>Unable to find images with tags: {this.props.tags}</h1>)
  }
  else{
    const eclipseContainer = {
      textAlign: "center",
      marginTop: "40px"
    }
    const hidden = { display: "none" }
    

    let thumbRows = [];

    for( let i = 0; i < this.state.imageArray.length; i++){
        thumbRows.push( <Thumbnail index={i} imageLoaded={() => this.imageLoaded()} imageData={this.state.imageArray[i]} key={i}/> )
    }

    return(   
    <div>
      <div className={"row align-items-center"} style={this.state.loading ? hidden : null}  >    
        {thumbRows}
      </div>
      { this.state.loading && <div style={eclipseContainer}>  <Eclipse/> </div> }
    </div>
    )
  }
 }
}

function noMatch(){
  return(
    <h1>404: The page you were looking for was not found.</h1>
  )
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
      currentPage: -1,
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
  
  setTags(inTags){
    this.setState({tags: inTags})
  }

  setPage(inPage){
    this.setState({currentPage: inPage})
  }


  render(){
  
    const thumbgrid = {
      padding: "60px 0 80px 0"
    }
    const paginationStyle = {
      paddingBottom: "30px",
    }
    
  
    
    return(
    <Router>
      <div>
        <div className="container">
          <Tagbar service={this.state.service} onClick={(tag, page) => this.onClick(tag, page)}/> 
        </div>
        <div className="container-fluid gridStyle">     
        <Switch>
          
            <Route path="/s/:service" render={({ location }) => { 
              return(
              <div>
                <div style={thumbgrid}> 
                  <Thumbgrid 
                  imageData={this.state.imageData}
                  update={this.state.update} 
                  service={this.state.service}
                  setTotalImages={(x) => this.setTotalImages(x)} 
                  page={this.state.currentPage} 
                  tags={this.state.tags} 
                  setTags={(x) => this.setTags(x)}
                  setPage={(x) => this.setPage(x)}
                  setGridLoaded={x => this.setGridLoaded(x)} 
                  setUpdate={x => this.setUpdate(x)} location={location}
                  /> 
                </div> 

                { this.state.gridLoaded && 
                <div style={paginationStyle}> 
                  <Pagination 
                  totalImages={this.state.totalImages} 
                  tags={this.state.tags} 
                  service={this.state.service}
                  onClick={(tags, page) => this.onClick(tags, page)}  
                  currentPage={this.state.currentPage} 
                  /> 
                </div> }
              </div> 
              )
            }}/>

            <Route path="/" exact render={() => {
              return(
                <div>
                <h1> Enter tags to search for images. </h1>
              </div>
              )
            }
            } />
            <Route component={noMatch}/>
          </Switch>

        </div>
      </div>
    </Router>
    )
  }

}

export default App;
