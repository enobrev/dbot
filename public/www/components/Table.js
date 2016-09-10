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
            table:  [ 'local', 'tables', this.props.id ],
            name:   [ 'local', 'tables', this.props.id, 'name' ],
            columns: {
                path:   [ 'local', 'columns' ],
                adjust: oState => {
                    oState.table_columns = Object.values(oState.columns).filter(oTable => oTable.table_id == this.props.id);
                    oState.show          = oState.table_columns.length > 0;
                }
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
                break;

            case 8: // BACKSPACE
                if (sName.length == 0) {
                    this.oCursors.table.unset();

                    console.log('TODO: Focus on Previous Column');
                }
                break;
        }
    }
}