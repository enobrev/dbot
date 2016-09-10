"use strict";

import ReactDOM from 'react-dom';
import React, { PropTypes } from "react";
import BaobabComponent from './BaobabComponent';

import Project from './Project';

import API from '../js/API';
import Data from '../js/Data';
import UUID from '../js/UUID';

import 'semantic-ui/semantic.js';
import 'semantic-ui/semantic.css!';

export default class App extends BaobabComponent {
    stateQueries() {
        return {
            projects: [ 'local', 'projects' ]
        }
    }

    adjustStateFromCursor(sKey, oState) {
        switch (sKey) {
            case 'projects':
                oState.project_array = Object.values(oState[sKey]);
                break;
        }
    }

    render() {
        const { project_array: aProjects } = this.state;
        return (
            <div className="ui stackable celled grid container">
                <div className="row">
                    <div className="column">
                        <div className="ui segment">
                            <div className="ui icon button" onClick={this.addProject}><i className="add icon" /> Add Project</div>
                        </div>
                    </div>
                </div>

                {aProjects.map(oProject => (
                    <div className="row" key={oProject.id}>
                        <div className="column">
                            <Project id={oProject.id} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    componentWillMount() {
        super.componentWillMount();

        API.query(['columns', 'column_types', 'notes', 'projects', 'tables'], (oError, oResponse) => Data.mergeResponse(oResponse));
    }

    addProject = () => {
        let oProject = {
            id:   UUID(),
            name: ''
        };

        this.oCursors.projects.set(oProject.id, oProject);
    }
}

ReactDOM.render(<App />, document.getElementById('root'));