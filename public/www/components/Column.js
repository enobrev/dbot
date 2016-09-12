"use strict";

import React, { PropTypes } from "react";
import BaobabComponent from './BaobabComponent';
import pluralize from 'pluralize';
import LocalData from '../js/LocalData';

export default class Column extends BaobabComponent {
    static propTypes = {
        id: PropTypes.string
    };

    static defaultProps = {};

    stateQueries() {
        return {
            column:        [ 'local', 'columns', this.props.id ],
            tables:        {
                cursor:       [ 'local', 'tables' ],
                invokeRender: false,
                setState:     oState => oState.table = oState.tables[ oState.column.table_id ]
            },
            columns:       {
                cursor:       [ 'local', 'columns' ],
                invokeRender: false,
                setState:     oState => oState.table_columns = Object.values(oState.columns).filter(oColumn => oColumn.table_id == oState.column.table_id)
            },
            table_columns: {
                invokeRender: false,
                setState:     oState => oState.column_index = oState.table_columns.findIndex(oColumn => oColumn.id == oState.column.id)
            },
            focus:         {
                cursor:   [ 'state', 'www', 'focus' ],
                setState: oState => {
                    oState.stealFocus = oState.focus == 'column-' + oState.column.id;
                }
            }
        }
    }

    render() {
        const { column: oColumn } = this.state;

        return (
            <form className="ui form" onSubmit={oEvent => oEvent.preventDefault()}>
                <div className="ui six fields">
                    <div className="field">
                        <input ref="name_short"        name="name_short"       value={oColumn.name_short}       placeholder="Short Name"       onChange={this.updateProperty} onKeyDown={this.onKeyDown} />
                    </div>
                    <div className="field">
                        <input ref="name"              name="name"             value={oColumn.name}             placeholder="Name"             onChange={this.updateProperty} />
                    </div>
                    <div className="field">
                        <input ref="name_singular"     name="name_singular"    value={oColumn.name_singular}    placeholder="Singular"         onChange={this.updateProperty} />
                    </div>
                    <div className="field">
                        <input ref="name_plural"       name="name_plural"      value={oColumn.name_plural}      placeholder="Plural"           onChange={this.updateProperty} />
                    </div>
                    <div className="field">
                        <input ref="display_singular"  name="display_singular" value={oColumn.display_singular} placeholder="Singular Display" onChange={this.updateProperty} />
                    </div>
                    <div className="field">
                        <input ref="display_plural"    name="display_plural"   value={oColumn.display_plural}   placeholder="Plural Display"   onChange={this.updateProperty} />
                    </div>
                </div>
            </form>
        )
    }

    stealFocus() {
        if (this.state.stealFocus) {
            this.refs.name_short.focus();
        }
    }

    componentDidMount() {
        this.stealFocus();
    }

    componentDidUpdate() {
        this.stealFocus();
    }

    updateProperty = oEvent => {
        if (oEvent.target.name == 'name_short') {
            const { table: oTable } = this.state;

            let oMerge = {
                name_short: oEvent.target.value
            };

            let sTablePrefix = oTable.name_singular ? oTable.name_singular + '_' : '';

            if (oMerge.name_short.match(/_id$/)) {
                sTablePrefix = '';
            }

            oMerge.name             = sTablePrefix + oMerge.name_short;
            oMerge.name_singular    = pluralize.singular(oMerge.name);
            oMerge.name_plural      = pluralize.plural(oMerge.name);
            oMerge.display_singular = oMerge.name_singular.replace(/_/g, ' ').replace(/\b\w/g, sLetter => sLetter.toUpperCase());
            oMerge.display_plural   = oMerge.name_plural.replace(/_/g, ' ').replace(/\b\w/g, sLetter => sLetter.toUpperCase());

            this.CURSORS.column.merge(oMerge);
        } else {
            this.CURSORS.column.merge({[oEvent.target.name]: oEvent.target.value});
        }
    };

    onKeyDown = oEvent => {
        const {
            column:         oColumn,
            table:          oTable,
            table_columns:  aColumns,
            column_index:   iIndex
        } = this.state;

        const iNameShort = oColumn.name_short !== undefined ? oColumn.name_short.length : 0;

        switch(oEvent.keyCode) {
            case 13: // ENTER
                if (iNameShort) {
                    if (aColumns.length > iIndex + 1) {
                        this.CURSORS.focus.set('column-' + aColumns[ iIndex + 1 ].id);
                    } else {
                        let oNewColumn = LocalData.newColumn(oTable.id);
                        this.CURSORS.column.up().set(oNewColumn.id, oNewColumn);
                        this.CURSORS.focus.set('column-' + oNewColumn.id);
                    }
                } else {
                    console.log('TODO: Check for Next Table and switch to there if we are not at the bottom of the project');

                    let oNewTable = LocalData.newTable(oTable.project_id);

                    this.CURSORS.column.unset();
                    this.CURSORS.tables.set(oNewTable.id, oNewTable);
                    this.CURSORS.focus.set('table-' + oNewTable.id);
                }
                break;

            case 8: // BACKSPACE
                if (iNameShort == 0) {
                    this.CURSORS.column.unset();

                    // Remember that aColumns is outdated at this point because that "unset" has not taken yet
                    if (aColumns.length > 1) {
                        if (iIndex < aColumns.length - 1) {
                            this.CURSORS.focus.set('column-' + aColumns[ iIndex + 1 ].id);
                        } else {
                            this.CURSORS.focus.set('column-' + aColumns[ iIndex - 1 ].id);
                        }
                    } else {
                        this.CURSORS.focus.set('table-' + oTable.id);
                    }
                }
                break;


        }
    }
}