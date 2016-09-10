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
            column:  [ 'local', 'columns', this.props.id ]
        }
    }

    render() {
        const {
            column: oColumn
        } = this.state;

        return (
            <form className="ui form" onSubmit={oEvent => oEvent.preventDefault()}>
                <div className="field">
                    <input type="text" ref="input" name="name" value={oColumn.name} placeholder="Column Name" onChange={this.updateName} onKeyUp={this.keyUp} />
                </div>
            </form>
        )
    }

    componentDidMount() {
        this.refs.input.focus();
    }

    updateName = oEvent => {
        this.oCursors.column.merge({[oEvent.target.name]: oEvent.target.value});
    };

    keyUp = oEvent => {
        const { column: oCurrentColumn } = this.state;

        switch(oEvent.keyCode) {
            case 13: // ENTER
                if (oCurrentColumn.name.length) {
                    console.log('New Column');
                    let oColumn = {
                        id:         UUID(),
                        table_id:   oCurrentColumn.table_id,
                        name:       ''
                    };

                    Data.Base.select('local', 'columns').set(oColumn.id, oColumn);
                } else {
                    Data.Base.select('local', 'columns').unset(this.props.id);

                    console.log('Delete Column, Add Table');
                }
                break;

            case 8: // BACKSPACE
                if (oCurrentColumn.name.length == 0) {
                    Data.Base.select('local', 'columns').unset(this.props.id);

                    console.log('TODO: Focus on Previous Column');
                }
                break;


        }
    }
}