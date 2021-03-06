"use strict";

import React, { PropTypes } from "react";
import BaobabComponent from './BaobabComponent';
import Table from './Table';
import LocalData from '../js/LocalData';

export default class Project extends BaobabComponent {
    static propTypes = {
        id: PropTypes.string
    };

    static defaultProps = {};

    stateQueries() {
        return {
            name:   [ 'local', 'projects', this.props.id, 'name' ],
            tables: {
                cursor:   [ 'local', 'tables' ],
                setState: oState => oState.project_tables = Object.values(oState.tables).filter(oTable => oTable.project_id == this.props.id)
            },
            focus:        {
                cursor:   [ 'state', 'www', 'focus' ],
                setState: oState => oState.stealFocus = oState.focus
                                                     && oState.focus.type == 'project'
                                                     && oState.focus.id   == this.props.id
            },
            stealFocus: {
                setState: oState => {
                    this.stealFocus(oState);
                }
            }
        }
    }

    stealFocus(oState) {
        if (oState.stealFocus) {
            let oRef = this.refs[oState.focus.ref] || this.refs.name;
            if (oRef) {
                oRef.focus();
            }
        }
    };

    componentDidMount() {
        this.stealFocus(this.state);
    }

    render() {
        const {
            name:           sName,
            project_tables: aTables
        } = this.state;

        return (
            <div className="ui segment">
                <form className="ui form" onSubmit={oEvent => oEvent.preventDefault()}>
                    <div className="header basic field">
                        <input type="text" ref="name" name="name" value={sName} placeholder="Project Name" onChange={this.updateName} onKeyDown={this.onKeyDown} />
                    </div>
                </form>

                {aTables.map(oTable => <Table key={oTable.id} id={oTable.id} />)}
            </div>
        )
    }

    updateName = oEvent => {
        this.CURSORS.name.set(oEvent.target.value);
    };

    onKeyDown = oEvent => {
        const { project_tables: aTables, name: sName } = this.state;

        switch(oEvent.keyCode) {
            case 13: // ENTER
                if (aTables.length) {
                    // Focus on the first one
                    this.CURSORS.focus.set({
                        type:  'table',
                        id:    aTables[0]
                    });
                } else {
                    let oNewTable = LocalData.newTable(this.props.id);
                    this.CURSORS.tables.set(oNewTable.id, oNewTable);
                    this.CURSORS.focus.set({
                        type:  'table',
                        id:    oNewTable.id
                    });
                }
                break;

            case 8: // BACKSPACE
                if (sName.length == 0) {
                    this.CURSORS.name.up().unset();

                    console.log('TODO: Focus on Previous Table or Project');
                }
                break;
        }
    }
}