"use strict";

import React, { PropTypes } from "react";
import BaobabComponent from './BaobabComponent';
import Table from './Table';
import UUID from '../js/UUID';

export default class Project extends BaobabComponent {
    static propTypes = {
        id: PropTypes.string
    };

    static defaultProps = {};

    stateQueries() {
        return {
            project: [ 'local', 'projects', this.props.id ],
            tables:  [ 'local', 'tables' ],
        }
    }

    adjustStateFromCursor(sKey, oState) {
        switch (sKey) {
            case 'tables':
                oState.project_tables = Object.values(oState.tables).filter(oTable => oTable.project_id == this.props.id);
                break;
        }
    }

    render() {
        const {
            project:        oProject,
            project_tables: aTables
        } = this.state;

        console.log('Project.render');

        return (
            <div className="ui segment">
                <form className="ui form" onSubmit={oEvent => oEvent.preventDefault()}>
                    <div className="header basic field">
                        <input type="text" ref="input" name="name" value={oProject.name} placeholder="Project Name" onChange={this.updateName} onKeyUp={this.keyUp} />
                    </div>
                </form>

                {aTables.map(oTable => <Table key={oTable.id} id={oTable.id} />)}
            </div>
        )
    }

    componentDidMount() {
        this.refs.input.focus();
    }

    updateName = oEvent => {
        this.oCursors.project.merge({[oEvent.target.name]: oEvent.target.value});
    };

    keyUp = oEvent => {
        const {
            project:        oProject,
            project_tables: aTables
        } = this.state;

        if (oEvent.keyCode == 13) { // isEnter
            if (aTables.length) {
                // Focus on the first one
                console.log('focus on first table');
            } else {
                let oTable = {
                    id:         UUID(),
                    project_id: oProject.id,
                    name:       ''
                };

                console.log('create table', oTable);

                this.oCursors.tables.merge({[oTable.id]: oTable});
            }
        }
    }
}