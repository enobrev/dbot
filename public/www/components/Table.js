"use strict";

import React, { PropTypes } from "react";
import BaobabComponent from './BaobabComponent';
import Column from './Column';
import LocalData from '../js/LocalData';

export default class Table extends BaobabComponent {
    static propTypes = {
        id: PropTypes.string
    };

    static defaultProps = {};

    stateQueries() {
        return {
            table:  [ 'local', 'tables', this.props.id ],
            name:   [ 'local', 'tables', this.props.id, 'name' ],
            columns: {
                path:    [ 'local', 'columns' ],
                passive: true,
                adjust:  oState => oState.table_columns = Object.values(oState.columns).filter(oTable => oTable.table_id == this.props.id)
            },
            table_columns: {
                adjust: oState => oState.show = oState.table_columns.length > 0
            }
        }
    }

    render() {
        const {
            name:          sName,
            table_columns: aColumns,
            show:          bShow
        } = this.state;

        return (
            <div className="ui segment">
                <form className="ui form" onSubmit={oEvent => oEvent.preventDefault()}>
                    <div className="field">
                        <input type="text" ref="input" name="name" value={sName} placeholder="Table Name" onChange={this.updateName} onKeyUp={this.keyUp} />
                    </div>
                </form>

                <div className="ui basic segment" style={{display: bShow ? 'block' : 'none'}}>
                    {aColumns.map(oTable => <Column key={oTable.id} id={oTable.id} />)}
                </div>
            </div>
        )
    }

    componentDidMount() {
        this.refs.input.focus();
    }

    updateName = oEvent => {
        this.oCursors.name.set(oEvent.target.value);
    };

    keyUp = oEvent => {
        const {
            table_columns: aColumns,
            table:         oTable,
            name:          sName
        } = this.state;

        switch(oEvent.keyCode) {
            case 13: // ENTER
                if (aColumns.length) {
                    // Focus on the first one
                    console.log('TODO: focus on first column');
                } else {
                    let oNewColumn = LocalData.newColumn(oTable.id);
                    this.oCursors.columns.set(oNewColumn.id, oNewColumn);
                }
                break;

            case 8: // BACKSPACE
                if (sName.length == 0) {
                    this.oCursors.table.unset();

                    console.log('TODO: Focus on Previous Table or Project');
                }
                break;
        }
    }
}