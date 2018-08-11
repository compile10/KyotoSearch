import React, { Component } from 'react';
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
        thumbRows.push( <Thumbnail service="gelbooru" index={i} imageData={props.imageData[i]} key={props.imageData[i].hash}/> )
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
  }
  range(top){
    let range = []
    for(let i = 1; i <= top; i++ ){
      range.push(i);
    }
    return range; 
  }
  render(){

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
      service: 'gelbooru',
      loading: false
    }

  }

  onClick(input, page){
    this.setState({ 
      loading: true
    })
    var tag = escape(input)
    tag = tag.replace(/ /g , "+");
    const Url = `/api/images/${this.state.service}/?tags=${tag}&page=${page}`

    return fetch(Url)
      .then(stream =>  stream.json())
      .then(data => {
        console.log(`Loaded data for ${input}`)
        return data
      })
      .then(data => { this.setState({
          loading: false,
          imageData: data,
      }) })

  }

  render(){
    const hide = {
      display: 'none'
    }
    const show = {
      fontStyle: 'italic',
      textAlign: 'center',
      paddingTop: '60px',
    }
    const thumbgrid = {
      padding: "50px 0 60px 0"
       
    }
    let text 
    if(this.state.loading === true){
      text = 'Loading...'
    }
    else{
      text = 'Enter tags to search for images.'
    }
  
    return(
    <div>
      <div className="container">
        <Tagbar onClick={(tag) => this.onClick(tag)}/> 
      </div>
      <div className="container-fluid gridStyle">
         <h1 style={this.state.imageData.length !== 0 ? hide : show}> {text} </h1>
         { this.state.imageData.length !== 0 && <div style={thumbgrid}> <Thumbgrid imageData={this.state.imageData.imageArray}/> </div> }
         
      </div>
    </div>
    )
  }

}

export default App;
