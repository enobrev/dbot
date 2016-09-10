"use strict";

import React, { PropTypes } from "react";
import BaobabComponent from './BaobabComponent';
import Column from './Column';
import UUID from '../js/UUID';

export default class Table extends BaobabComponent {
    static propTypes = {
        id: PropTypes.string
    };

    static defaultProps = {};

    stateQueries() {
        return {
            table:   [ 'local', 'tables', this.props.id ],
            columns: [ 'local', 'columns' ],
        }
    }

    adjustStateFromCursor(sKey, oState) {
        switch (sKey) {
            case 'columns':
                oState.table_columns = Object.values(oState.columns).filter(oTable => oTable.table_id == this.props.id);
                break;
        }
    }

    render() {
        const {
            table:         oTable
        } = this.state;

        console.log('Table.render');

        return (
            <div className="ui segment">
                <form className="ui form" onSubmit={oEvent => oEvent.preventDefault()}>
                    <div className="field">
                        <input type="text" ref="input" name="name" value={oTable.name} placeholder="Table Name" onChange={this.updateName} onKeyUp={this.keyUp} />
                    </div>
                </form>

                {this.renderColumns()}
            </div>
        )
    }

    renderColumns() {
        const {
            table_columns: aColumns
        } = this.state;

        if (aColumns.length == 0) {
            return null;
        }

        return (
            <div className="ui basic segment">
                {aColumns.map(oTable => <Column key={oTable.id} id={oTable.id} />)}
            </div>
        )
    }

    componentDidMount() {
        this.refs.input.focus();
    }

    updateName = oEvent => {
        this.oCursors.table.select(oEvent.target.name).set(oEvent.target.value);
    };

    keyUp = oEvent => {
        const {
            table:         oTable,
            table_columns: aColumns
        } = this.state;

        if (oEvent.keyCode == 13) { // isEnter
            if (aColumns.length) {
                // Focus on the first one
                console.log('focus on first column');
            } else {
                console.log('create column');
                let oColumn = {
                    id:         UUID(),
                    table_id:   oTable.id,
                    name:       ''
                };

                this.oCursors.columns.set(oColumn.id, oColumn);
            }
        }
    }
}