import React, { Component } from 'react';
import './App.css';

 class App extends Component{
  constructor(props){
    super(props);
    this.state = {
      tag: ''
    }
  }

  setTag(tag){
    this.setState({
      tag: tag
    })
  }

  render(){
    const hide = {
      visibility: 'hidden'
    }
    const show = {
      fontStyle: 'italic',
      textAlign: 'center',
      paddingTop: '80px',
    }
    return(
    <div className="App">
       <Tagbar onClick={(tag) => this.setTag(tag)}/> 
       
       <h1 style={this.state.tag ? hide : show}> Enter a tag to search for images. </h1>

       
    </div>
    
    )
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
           <input type="text" class="form-control" placeholder="Search Tags" value={this.state.inputvalue} onChange={this.handleChange } onKeyPress={this.enterKey} />
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

export default App;
