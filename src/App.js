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
    return(
    <div className="App">
       <Tagbar onClick={(tag) => this.setTag(tag)}/> 
       <p>{this.state.tag}</p>
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
  }
  handleChange(event){
    this.setState({
      inputvalue: event.target.value,
    })
  }

  render(){
    return(
      <div className="Tagbar" >
       <div className="row justify-content-center">
        <div className ="col-3">
         <form>
           <input type="text" class="form-control" placeholder="Search Tags" value={this.state.inputvalue} onChange={this.handleChange}/>
        </form>
        </div>
        <div className="col-1">
        <button type="button" className="btn btn-primary" onClick={() => this.props.onClick(this.state.inputvalue)}>>Search</button>
        </div>
        </div>
      </div>
    )
  }
}

export default App;
