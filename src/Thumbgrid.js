import React, { Component } from 'react';

import Eclipse from './Eclipse';
import Thumbnail from './Thumbnail'

import convertToURI, {convertToTyped, source} from './Helper'



class Thumbgrid extends Component {
    constructor(props) {
      super(props)
      this.state = {
        loading: true,
        imageArray: [], 
        totalImages: 0,
        imagesLoaded: 0,
        badTagError: false,
        urlError: false
      }
  
    }
  
     getImages = (getsource, unescapedTags, page) => {
      this.props.setGridLoaded(false)
      this.setState({
        loading: true,
        imageArray: [],
        imagesLoaded: 0
      })
      var tags = convertToURI(unescapedTags)
      const Url = `/api/images/${getsource}/?tags=${tags}&page=${page}`
      
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
            this.props.setTotalImages(data.totalImages)
          } 
        })
    }
  
      // TODO: add error handling for urls with no query strings
    componentDidMount(){
      this.props.setUpdate(false)
  
      const params = new URLSearchParams(this.props.location.search) //?tags=tag1+tag2+...
  
  
      let tags
      let page
      let checksource
      
      if(this.props.page === -1){
        page = params.get("page")
        if(page === null){
          page = 1
        }
        else{
          page = parseInt(page, 10)
        }
        this.props.setPage(page)
      }
      else{
        page = this.props.page
      }
  
      if(this.props.tags === ''){
        tags = params.get("tags")
        this.props.setTags(tags)
      }
      else{
        tags = this.props.tags
      }
      let urlError = false

      if(this.props.source === ''){
        checksource = this.props.urlSource
        if(!(checksource in source)){
          this.setState({urlError: true})
          urlError = true
        }
        this.props.setSource(checksource)
      }
      else{
        checksource = this.props.source
      }
  
      if(urlError === false){
        document.title = `${convertToTyped(tags)} - waifuSearch`
        this.getImages(checksource, tags, page)
      }
  
  
    }
  
  
   
   componentDidUpdate(){
    
    if(this.props.update === true){
      this.setState({urlError: false})
      document.title = `${this.props.tags} - waifuSearch`
      this.props.setUpdate(false)
      this.getImages(this.props.source, this.props.tags, this.props.page)
    }
  
     if(this.state.imagesLoaded === this.state.imageArray.length && this.state.loading === true && this.state.imageArray.length !== 0){
       this.setState({loading: false})
       this.props.setGridLoaded(true)
     }
   
   }
  
   imageLoaded = () => {
     console.log("ADDED")
     this.setState( prevState  => { return {imagesLoaded: prevState.imagesLoaded + 1} } )
   }
  
   render() {
    if(this.state.urlError === true){
      return(<h1>404: The page you were looking for was not found.</h1>)
    }
    
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
          thumbRows.push( <Thumbnail index={i} imageLoaded={this.imageLoaded} imageData={this.state.imageArray[i]} key={i}/> )
      }
        
      const thumbgrid = {
        padding: "60px 0 80px 0"
      }
      return(   
      <div style={thumbgrid}>
        <div className={"row align-items-center"} style={this.state.loading ? hidden : null}  >    
          {thumbRows}
        </div>
        { this.state.loading && <div style={eclipseContainer}>  <Eclipse/> </div> }
      </div>
      )
    }
   }
  }
  
  export default Thumbgrid;