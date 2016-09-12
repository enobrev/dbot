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
                cursor:    ['local', 'tables'],
                invokeRender: false,
                setState:  oState => oState.table = oState.tables[oState.column.table_id]
            },
            columns: {
                cursor: [ 'local', 'columns' ],
                invokeRender: false,
                setState: oState => oState.table_columns = Object.values(oState.columns).filter(oColumn => oColumn.table_id == oState.column.table_id)
            },
            table_columns: {
                invokeRender: false,
                setState: oState => oState.column_index  = oState.table_columns.findIndex(oColumn => oColumn.id == oState.column.id)
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
                    <input type="text" ref="input" name="name" value={sName} placeholder="Column Name" onChange={this.updateName} onKeyDown={this.onKeyDown} />
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

    onKeyDown = oEvent => {
        const { name: sName, table: oTable, table_columns: aColumns, column_index: iIndex } = this.state;

        switch(oEvent.keyCode) {
            case 13: // ENTER
                if (sName.length) {
                    let oNewColumn = LocalData.newColumn(oTable.id);
                    console.log('New Column', oNewColumn)
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

                    // Remember that aColumns is outdated at this point because that "unset" has not taken yet
                    if (aColumns.length > 1) {
                        if (iIndex < aColumns.length - 1) {
                            console.log('TODO: Focus on Next Column', aColumns[ iIndex + 1 ]);
                        } else {
                            console.log('TODO: Focus on Previous Column', aColumns[ iIndex - 1 ]);
                        }
                    } else {
                        console.log('TODO: Focus on Table', oTable);
                    }
                }
                break;


        }
    }
}