"use strict";

import async from 'async';
import ClassNames from 'classnames';
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
            tab: [ 'state', 'www', 'tab'],
            projects: {
                cursor:   [ 'local', 'projects' ],
                setState: oState => oState.projects_array = Object.values(oState.projects)
            },
            column_types: {
                cursor:  [ 'local', 'column_types'],
                setState: oState => oState.types = Data.sortObjectBy(oState.column_types, 'date_added')
            },
            focus:        {
                cursor:   [ 'state', 'www', 'focus' ],
                invokeRender: false,
            }
        }
    }

    render() {
        const { tab: sTab } = this.state;

        return (
            <div className="ui container">
                <div className="ui top attached tabular menu">
                    <a className={ClassNames("item", {active: sTab == 'projects'})} onClick={this.openProjects}>
                        Projects
                    </a>
                    <a className={ClassNames("item", {active: sTab == 'types'})} onClick={this.openTypes}>
                        Types
                    </a>
                    <a className="item" onClick={this.save}>
                        <i className="save icon" /> Save
                    </a>
                </div>
                {this.renderTab()}
            </div>
        );
    }

    renderTab() {
        switch(this.state.tab) {
            case 'projects': return this.renderProjects(); break;
            case 'types':    return this.renderTypes();    break;
        }
    }

    renderProjects() {
        const { projects_array: aProjects } = this.state;

        if (!aProjects || aProjects.length == 0) {
            return (
                <div className="ui bottom attached segment">
                    <div className="ui icon button" onClick={this.addProject}><i className="add icon" /> Add Project</div>
                </div>
            )
        }

        return (
            <div className="ui bottom attached segment">
                {aProjects.map(oProject => (
                    <Project key={oProject.id} id={oProject.id} />
                ))}
            </div>
        );
    }

    renderTypes() {
        const { types: aTypes } = this.state;

        if (aTypes.length == 0) {
            return (
                <div className="ui bottom attached segment">
                    <div className="ui icon button" onClick={this.addType}><i className="add icon" /> Add Type</div>
                </div>
            );
        }

        return (
            <div className="ui bottom attached segment">
                {aTypes.map(oType => <Type key={oType.id} id={oType.id} />)}
            </div>
        );
    }

    openProjects = () => {
        this.CURSORS.tab.set('projects');
    };

    openTypes = () => {
        this.CURSORS.tab.set('types');
    };

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