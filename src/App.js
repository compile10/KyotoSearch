import React, { Component } from 'react';
import './App.css';

class Thumbnail extends React.Component {
  constructor(props) {
    super(props)
    this.thumbnailUrl = this.thumbnailUrl.bind(this)
  }

  thumbnailUrl(imageobj){
    let url = ''
    if(this.props.service === "gelbooru"){
       url = `https://simg3.gelbooru.com/thumbnails/${imageobj.directory}/thumbnail_${imageobj.hash}.jpg`
    }
    else{
      return
    }
    return url
  }

  render() {

    
    const colStyle = {
      textAlign: "center"
    }

    return(
      <div className="col-4 col-lg-2 col-xl" style={colStyle}>
        <a rel="noreferrer" href={this.props.imageData.file_url} > <img alt="Thumbnail" className="img-fluid" src={this.thumbnailUrl(this.props.imageData)}/> </a> 
      </div> 
    )
  }
}

function Row(props){
 let newRow = [];
  for( let i = 0; i < 10; i++){
    if(props.imageDataArray.length !== 0){
     newRow.push( <Thumbnail service="gelbooru" imageData={props.imageDataArray.shift()} key={i}/>)
    }
  } 
  
  return(
    <div className="row px-5 py-4">
      {newRow} 
    </div>

  )
}



function Thumbgrid(props){

    let thumbRows = [];
    let arrayCopy = JSON.parse(JSON.stringify(props.imageData))
        
    for( let i = 0; i < 10; i++){
      thumbRows.push( <Row imageDataArray={arrayCopy} key={i}/>)
    } 
    return(   
     <div>       
      {thumbRows}
     </div>
    )
  
      
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
      this.props.onClick(this.state.inputvalue); 
}
  }

  render(){
    return(
      <div className="Tagbar" >
       <div className="row justify-content-center">
        <div className ="col-3">
         <form>
           <input type="text" className="form-control" placeholder="Search Tags" value={this.state.inputvalue} onChange={this.handleChange } onKeyPress={this.enterKey} />
        </form>
        </div>
        <div className="col-1">
        <button type="button" className="btn btn-primary" onClick={() => this.props.onClick(this.state.inputvalue)}>Search</button>
        </div>
        </div>
      </div>
    )
  }
}





class App extends Component{
  constructor(props){
    super(props);
    this.state = {
      imageData: [],
      service: 'gelbooru',
      loading: false
    }

  }

  onClick(input){
    this.setState({ 
      loading: true
    })
    var tag = escape(input)
    tag = tag.replace(/ /g , "+");
    const Url = `/api/images/${this.state.service}/?tags=${tag}`

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
      paddingTop: '80px',
    }
    const thumbgrid = {
      padding: "60px 0 60px 0"
       
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
      <div className="container-fluid">
         <h1 style={this.state.imageData.length !== 0 ? hide : show}> {text} </h1>
         { this.state.imageData.length !== 0 && <div style={thumbgrid}> <Thumbgrid imageData={this.state.imageData}/> </div> }
         
      </div>
    </div>
    )
  }

}

export default App;
