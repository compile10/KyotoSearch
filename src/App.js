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
   
    const imgstyle= { 
      maxWidth: '150px',
      maxHeight: '200px',
      
    }

    return(
      <div class="col">
        <a href={this.props.imageData.file_url}> <img alt="Thumbnail" style={imgstyle} src={this.thumbnailUrl(this.props.imageData)}/> </a> 
      </div> 
    )
  }
}

function Row(prop){
  let newRow = [];
  for( let i = 0; i < 10; i++){
    if(this.props.imageDataArray.length !== 0){
     newRow.push( <Thumbnail imageData={this.props.imageArrayData.shift()} key={i}/>)
    }
  }
  return(
    <div className="row">
      {newRow} 
    </div>
  )
}



class Thumbgrid extends Component{
  constructor(props){
    super(props);
    this.state = {
      loading: true, 
      imageDataArray: [{}]
    }
  }

  componentWillMount(){
    const Url = `/api/images/${this.props.service}/?tags=${this.props.tag}`

    return fetch(Url)
      .then((stream) => {return stream.json()})
      .then((data) => {return data} )
      .then((data) => { this.setState({
          imageDataArray: data,
          loading: false
      }) })

  }

  

  render(){
      if(this.state.loading === false){
        let rows = [];
        let arrayCopy = this.imageDataArray; 
        for( let i = 0; i < 10; i++){
          rows.push( <Row imageDataArray={arrayCopy} key={i}/>)
        }
        return(
          <div> {rows} </div>
        )
      }
      else{
        const loadingtext = {
          fontStyle: 'italic',
          textAlign: 'center',
          paddingTop: '80px',
        }
        return (
          <h1 style={loadingtext}> Loading... </h1>
        )
      }
      
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
      tag: '',
    }
  }

  setTag(tag){
    this.setState({
      tag: tag
    })
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

    }
    
    return(
    <div className="container">
       <Tagbar onClick={(tag) => this.setTag(tag)}/> 
       <h1 style={this.state.tag ? hide : show}> Enter a tag to search for images. </h1>
       { this.state.tag && <Thumbgrid tag={this.state.tag} service="gelbooru"/> }
    </div>
    
    )
  }

}

export default App;
