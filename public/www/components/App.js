"use strict";

import async from 'async';
import ReactDOM from 'react-dom';
import React, { PropTypes } from "react";
import BaobabComponent from './BaobabComponent';

import Project from './Project';
import Type from './Type';

import API from '../js/API';
import Data from '../js/Data';
import UUID from '../js/UUID';

import 'semantic-ui/semantic.js';
import 'semantic-ui/semantic.css!';

export default class App extends BaobabComponent {
    stateQueries() {
        return {
            projects: {
                cursor:   [ 'local', 'projects' ],
                setState: oState => oState.projects_array = Object.values(oState.projects)
            },
            column_types: {
                cursor:  [ 'local', 'column_types'],
                setState: oState => oState.types = Object.values(oState.column_types)
            },
            focus:   {
                cursor: [ 'state', 'www', 'focus' ],
                onUpdate: oState => {
                    console.log(oState.focus);
                }
            }
        }
    }

    render() {
        const {
            projects_array: aProjects,
            types:          aTypes
        } = this.state;

        return (
            <div className="ui stackable celled grid container">
                <div className="row">
                    <div className="column">
                        <div className="ui segment">
                            <div className="ui buttons">
                                <div className="ui icon button" onClick={this.addType}><i className="add icon" /> Add Type</div>
                                <div className="ui icon button" onClick={this.addProject}><i className="add icon" /> Add Project</div>
                                <div className="ui icon button" onClick={this.save}><i className="save icon" /> Save</div>
                            </div>
                        </div>
                    </div>
                </div>

                {aProjects && aProjects.map(oProject => (
                    <div className="row" key={oProject.id}>
                        <div className="column">
                            <Project id={oProject.id} />
                        </div>
                    </div>
                ))}

                {this.renderTypes()}
            </div>
        );
    }

    renderTypes() {
        const { types: aTypes } = this.state;

        if (aTypes.length == 0) {
            return null;
        }

        return (
            <div className="row">
                <div className="column">
                    <div className="ui segment">
                        {aTypes.map(oType => <Type key={oType.id} id={oType.id} />)}
                    </div>
                </div>
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

        this.CURSORS.projects.set(oProject.id, oProject);
        this.CURSORS.focus.set('project-' + oProject.id);
    };

    addType = () => {
        let oType = {
            id:   UUID(),
            name: ''
        };

        this.CURSORS.column_types.set(oType.id, oType);
        this.CURSORS.focus.set('type-' + oType.id);
    };

    save = () => {
        let oServer = Data.Base.project({
            projects:     ['server', 'projects'],
            tables:       ['server', 'tables'],
            columns:      ['server', 'columns'],
            column_types: ['server', 'column_types'],
            notes:        ['server', 'notes']
        });

        let oLocal = Data.Base.project({
            projects:     ['local', 'projects'],
            tables:       ['local', 'tables'],
            columns:      ['local', 'columns'],
            column_types: ['local', 'column_types'],
            notes:        ['local', 'notes']
        });

        let aDeletions = [];
        for (let sTable in oServer) {
            for (let sRecord in oServer[sTable]) {
                if (oLocal[sTable][sRecord] === undefined) {
                    aDeletions.push(sTable + '/' + sRecord);
                }
            }
        }

        if (aDeletions.length) {
            async.eachLimit(aDeletions, 5, API.del, () => {
                API.query(oLocal, Data.mergeResponseDirectly);
            });
        } else {
            API.query(oLocal, Data.mergeResponseDirectly);
        }
    };
}

ReactDOM.render(<App />, document.getElementById('root'));