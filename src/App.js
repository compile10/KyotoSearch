import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { Pagination, Tagbar } from './Navigation';
import Thumbgrid from './Thumbgrid'

import 'animate.css/animate.min.css'
import './App.css';




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
      source: -1,
      currentPage: -1,
      tags: '',
      gridLoaded: false
    }
  }

  onClick(tags, currentPage, source){
    this.setState(
      {
        tags,
        currentPage,
        source,
        update: true
      }
    )
  }

  onClickPagination(tags, currentPage){
    this.setState(
      {
        tags,
        currentPage,
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

  setSource(inSource){
    this.setState({source: inSource})
  }




  render(){
  
  
    const paginationStyle = {
      paddingBottom: "30px",
    }
    
  
    
    return(
    <Router>
      <div>
        <div className="container">
          <Tagbar 
            onClick={(x,y,z) => this.onClick(x,y,z)}
            source={this.state.source}
          /> 
        </div>
        <div className="container-fluid gridStyle">     
        <Switch>
          
            <Route path="/s/:source" render={({ location, match }) => { 
              return(
              <div>
              
                  <Thumbgrid 
                  update={this.state.update} 
                  source={this.state.source}
                  setTotalImages={(x) => this.setTotalImages(x)} 
                  page={this.state.currentPage} 
                  tags={this.state.tags} 
                  setTags={(x) => this.setTags(x)}
                  urlSource= {match.params.source}
                  setPage={(x) => this.setPage(x)}
                  setGridLoaded={x => this.setGridLoaded(x)} 
                  setSource={x => this.setSource(x)}
                  setUpdate={x => this.setUpdate(x)} 
                  location={location}
                  /> 
              

                { this.state.gridLoaded && 
                <div style={paginationStyle}> 
                  <Pagination 
                  totalImages={this.state.totalImages} 
                  tags={this.state.tags} 
                  source={this.state.source}
                  onClick={(tags, page) => this.onClickPagination(tags, page)}  
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
