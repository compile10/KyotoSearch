import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";


import { Pagination, Tagbar } from './Navigation.js';
import Eclipse from './Eclipse';
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
  this.urlEntry = this.props.urlEntry.bind(this)
 }

 componentDidMount(){
  
  const params = new URLSearchParams(this.props.location.search) //?tags=tag1+tag2+...
  const titleTags = params.get("tags").replace(/\+/g , ' ');

  document.title = `${titleTags} - waifuSearch`

  //checks if Thumbgrid was loaded in without data. If it was, then grab data from url. If page property is missing then default to page 1.
  if(this.props.tags === ''){ 
    let page = params.get("page")
    if(page === "")
    {
      page = 1
    }
    this.urlEntry(params.get("tags"), page)
  }


 }
 render() {

  let thumbRows = [];

  for( let i = 0; i < this.props.imageData.length; i++){
      thumbRows.push( <Thumbnail service="gelbooru" index={i} imageData={this.props.imageData[i]} key={i}/> )
  }

  return(   
   <div className="row align-items-center" >    
    {thumbRows}
   </div>
  )
 }
}

function Home(props){
  let text = 'Enter tags to search for images.'


  const hide = {
    display: 'none'
  }
  const show = {
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '60px 0 60px 0',
  }


  const queryTags = props.tags.replace(/ /g , "+");

  return(
    <div>
      <h1 style={props.totalImages === 0 && !props.loading ? show : hide}> {text} </h1>
      {props.loading && <div> <Eclipse/> </div>}
      {!props.loading && props.totalImages !== 0 && <Redirect to={ `/s/${props.service}/?tags=${queryTags}&page=${props.page}` }/>}
    </div>
  )
  
}


//TODO: update navbar with URL
//TODO: add error code for bad URLS (with redirect in grid?)
//TODO: rewrite search so it updates the page

class App extends Component{
  constructor(props){
    super(props);
    this.state = {
      imageData: [],
      totalImages: 0,
      service: 'gelbooru',
      currentPage: 1,
      tags: '',
      loading: false,
      failed: false
    }

  }

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
      .then(data => {
        if(data.totalImages === 0){
          this.setState({
            loading: false,
            totalImages: 0,
            failed: true,
            imageData: []
          })
        }
        else{
         this.setState({
          imageData: data.imageArray,
          totalImages: data.totalImages,
          loading: false
        })
      }
     })

  }

  render(){
  
    const thumbgrid = {
      padding: "50px 0 45px 0"
    }
    const paginationStyle = {
      paddingBottom: "30px"
    }
   const failedText = {
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '60px 0 60px 0',
   }
   
    
    return(
    <Router>
      <div>
        <div className="container">
          <Tagbar onClick={(tag, page) => this.onClick(tag, page)}/> 
        </div>
        <div className="container-fluid gridStyle">
        
            {/* This text only displays when there are no images and no GET requests are occurring*/}
        

          <Route path="/s/:service" render={({ location }) =>       
        
          <div>
            <div style={thumbgrid}> <Thumbgrid imageData={this.state.imageData} urlEntry={(tags,page) => this.onClick(tags,page)} tags={this.state.tags} location={location}/> </div> 
            <div style={paginationStyle}> <Pagination totalImages={this.state.totalImages} tags={this.state.tags} 
            onClick={(tag, page) => this.onClick(tag, page)} loading={this.state.loading} currentPage={this.state.currentPage} service={this.state.service}/> </div>
            </div>
      
           }/>

          <Route exact path="/" render={() => 
            <Home loading={this.state.loading} totalImages={this.state.totalImages} tags={this.state.tags} page={this.state.currentPage} service={this.state.service}/>
          } />

        </div>
      </div>
    </Router>
    )
  }

}

export default App;
