"use strict";

import ReactDOM from 'react-dom';
import React, { PropTypes } from "react";
import BaobabComponent from './BaobabComponent';

import API from '../js/API';
import Data from '../js/Data';

import 'semantic-ui/semantic.js';
import 'semantic-ui/semantic.css!';

import '../js/API.test.js';

export default class App extends BaobabComponent {
    stateQueries() {
        return {
            projects: [ 'local', 'projects' ]
        }
    }

    render() {
        return (
            <div>
                Hi!
            </div>
        );
    }

    componentWillMount() {
        super.componentWillMount();

        //API.query(['columns', 'column_types', 'notes', 'projects', 'tables'], (oError, oResponse) => Data.mergeResponse(oResponse));
    }
}

ReactDOM.render(<App />, document.getElementById('root'));