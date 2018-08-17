import React, { Component } from 'react';
import './Eclipse.css'

class Eclipse extends Component{
    render(){
        const eclipseStyle = {
            width: "100%",
            height: "100%"
        }
        const outStyle = {
            display: "inline-block",
            textAlign: "center",
            marginTop: "80px"
        }

        return(
            <div style={outStyle} className="lds-css ng-scope">
                <div style={eclipseStyle} className="lds-eclipse">
                    <div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Eclipse; 