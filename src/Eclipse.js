import React, { Component } from 'react';
import './Eclipse.css'

class Eclipse extends Component{
    render(){
        const eclipseStyle = {
            width: "100%",
            height: "100%"
        }
        const outStyle = {
            display: "inline-block"
        }
        
        return(
            <div style={outStyle} class="lds-css ng-scope">
                <div style={eclipseStyle} class="lds-eclipse">
                    <div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Eclipse; 