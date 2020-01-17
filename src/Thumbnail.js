import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class Thumbnail extends Component{
    constructor(props){
      super(props);
      this.state = {
        error: false
      }
      this.onError = this.onError.bind(this);
    }
    onError(){
      this.props.imageLoaded() 
      this.setState({error: true})
    }
    componentDidMount(){
      if(!this.props.imageData.thumbURL && this.state.error === false){
        this.onError()
      }
    }
    render(){
        const colStyle = {
          textAlign: "center"
        }
        const aStyle = {
          height: "130px",
          verticalAlign: "middle"
        }
        if(this.state.error === true){
          return(
            <div className="col-4  col-sm-3 col-md-2 col-lg-1 col-xl-1 img-lg" style={colStyle}>
              <a className="mb-4 d-block h-100" rel="noreferrer noopener" target="_blank"  href={this.props.imageData.pageURL} > 
                <div className="d-flex justify-content-center" style={aStyle}>
                  <FontAwesomeIcon  className="align-self-center" size="3x" icon="exclamation-triangle" />
                </div>
              </a>
            </div>
          )
        }
  
        return(
          <div className="col-4 col-sm-3 col-md-2 col-lg-1 col-xl-1 img-lg" style={colStyle}>
            <a className="mb-4 d-block h-100" rel="noreferrer noopener" target="_blank"  href={this.props.imageData.pageURL} > 
              <img alt="Thumbnail"  onError={this.onError} onLoad={this.props.imageLoaded} className="img-fluid animated fadeInUp" src={this.props.imageData.thumbURL}/>
            </a> 
          </div> 
          
        )
    }
  }
  


  export default Thumbnail; 