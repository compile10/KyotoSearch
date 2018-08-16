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




function Thumbgrid(props){
    let thumbRows = [];
        
    for( let i = 0; i < props.imageData.length; i++){
        thumbRows.push( <Thumbnail service="gelbooru" index={i} imageData={props.imageData[i]} key={i}/> )
    }     

    return(   
     <div className="row align-items-center" >    
      {thumbRows}
     </div>
    )
  
  }

function Home(props){
  let text = ''
  if(props.tags === ''){
     text = 'Enter tags to search for images.'
  }
  else{
    text = `Failed to find any images under tags: "${props.tags}".`
  }

  const hide = {
    display: 'none'
  }
  const show = {
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '60px 0 60px 0',
  }
  const eclipseStyle = {
    textAlign: "center",
    marginTop: "80px"
  }
  return(
    <div>
      <h1 style={props.totalImages === 0 && !props.loading ? show : hide}> {text} </h1>
      {props.loading && <div style={eclipseStyle}> <Eclipse/> </div>}
    </div>
  )
  
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
   

    //Changes text to error message only if tags were inputed

    

    return(
    <Router>
      <div>
        <div className="container">
          <Tagbar onClick={(tag, page) => this.onClick(tag, page)}/> 
        </div>
        <div className="container-fluid gridStyle">
        
            {/* This text only displays when there are no images and no GET requests are occurring*/}
        

          <Route path="/s/:service" render={() => 
          <div>
            <div style={thumbgrid}> <Thumbgrid imageData={this.state.imageData}/> </div> 
            <div style={paginationStyle}> <Pagination totalImages={this.state.totalImages} tags={this.state.tags} onClick={(tag, page) => this.onClick(tag, page)} currentPage={this.state.currentPage}/> </div>
          </div>
          } />

          <Route exact path="/" render={() => (
          this.state.imageData.length === 0 ? (
            <Home loading={this.state.loading} totalImages={this.state.totalImages} tags={this.state.tags}/>
          ) : (
            <Redirect to={`/s/${this.state.service}`}/>
            )
          )} />

        </div>
      </div>
    </Router>
    )
  }

}

export default App;
