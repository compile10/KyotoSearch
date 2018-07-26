import React, { Component } from 'react';
import './App.css';
/*
function Thumbnail(prop){
  const imgstyle= { 
    maxWidth: '150px',
    maxHeight: '200px',
    
  }
    return(
      <div>
      <a href={prop.url}><img style={imgstyle} src={prop.thumb}/></a> 
      </div> 
    )

}

function Row(prop){
return(
  <div className="row">
    <div className="col"><Thumbnail/></div>

  </div>
)
}

class thumbgrid extends Component{



  render(){
    let rows = [];
    for( let i = 0; i < 10; i++){
      rows.push( <Row imageData={props.ImageData} key={i}/>)
    }
    return(
      <div> {rows} </div>
    )
  }
}
*/


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
      tag: ''
    }
    this.fetchImgs = this.fetchImgs.bind(this);
  }

  setTag(tag){
    this.setState({
      tag: tag
    })
  }
  fetchImgs(tag){
    const Url=`https://gelbooru.com/index.php?page=dapi&s=post&q=index&limit=10&tags=${tag}&json=1`
    
 

    fetch(Url)
    .then((Data) => {return Data.json()})
    .then((Data) => {console.log(Data[0])})

    
  
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
    if(this.state.tag){
      this.fetchImgs(this.state.tag);
    }
    
    return(
    <div className="App">
       <Tagbar onClick={(tag) => this.setTag(tag)}/> 
       
       <h1 style={this.state.tag ? hide : show}> Enter a tag to search for images. </h1>
       
       
    </div>
    
    )
  }

}

export default App;
