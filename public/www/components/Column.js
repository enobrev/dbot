"use strict";

import React, { PropTypes } from "react";
import BaobabComponent from './BaobabComponent';
import Data from '../js/Data';
import UUID from '../js/UUID';

export default class Column extends BaobabComponent {
    static propTypes = {
        id: PropTypes.string
    };

    static defaultProps = {};

    stateQueries() {
        return {
            column:  [ 'local', 'columns', this.props.id ],
            name:    [ 'local', 'columns', this.props.id, 'name' ]
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
        const { column: oCurrentColumn, name: sName } = this.state;

        switch(oEvent.keyCode) {
            case 13: // ENTER
                if (sName.length) {
                    console.log('New Column');
                    let oColumn = {
                        id:         UUID(),
                        table_id:   oCurrentColumn.table_id,
                        name:       ''
                    };

                    this.oCursors.column.up().set(oColumn.id, oColumn);
                } else {
                    this.oCursors.column.unset();

                    console.log('TODO: Add Table');
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