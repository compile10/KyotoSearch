import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';

import './index.css';
import './styles/custom.scss';

import { library } from '@fortawesome/fontawesome-svg-core'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

library.add(faExclamationTriangle)

ReactDOM.render(<App />, document.getElementById("root"));
