"use strict";

import React, { PropTypes } from "react";
import BaobabComponent from './BaobabComponent';
import LocalData from '../js/LocalData';

export default class Column extends BaobabComponent {
    static propTypes = {
        id: PropTypes.string
    };

    static defaultProps = {};

    stateQueries() {
        return {
            column:  [ 'local', 'columns', this.props.id ],
            name:    [ 'local', 'columns', this.props.id, 'name' ],
            tables:   {
                path:    ['local', 'tables'],
                adjust:  oState => oState.table = oState.tables[oState.column.table_id]
            }
        }
    }

    render() {
        const {
            name: sName
        } = this.state;

        return (
            <form className="ui form" onSubmit={oEvent => oEvent.preventDefault()}>
                <div className="field">
                    <input type="text" ref="input" name="name" value={sName} placeholder="Column Name" onChange={this.updateName} onKeyUp={this.keyUp} />
                </div>
            </form>
        )
    }

    componentDidMount() {
        this.refs.input.focus();
    }

    updateName = oEvent => {
        this.oCursors.name.set(oEvent.target.value);
    };

    keyUp = oEvent => {
        const { name: sName, table: oTable } = this.state;

        switch(oEvent.keyCode) {
            case 13: // ENTER
                if (sName.length) {
                    let oNewColumn = LocalData.newColumn(oTable.id);
                    this.oCursors.column.up().set(oNewColumn.id, oNewColumn);
                } else {
                    let oNewTable = LocalData.newTable(oTable.project_id);

                    this.oCursors.column.unset();
                    this.oCursors.tables.set(oNewTable.id, oNewTable);
                }
                break;

            case 8: // BACKSPACE
                if (sName.length == 0) {
                    this.oCursors.column.unset();

                    console.log('TODO: Focus on Previous Column');
                }
                break;


        }
    }
}