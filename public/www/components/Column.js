"use strict";

import React, { PropTypes } from "react";
import ClassNames from 'classnames';
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
            show:          [ 'state', 'www', 'column', this.props.id, 'show' ],
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
        const { show: sShow } = this.state;

        switch(sShow) {
            default:
            case 'DETAILS': return this.renderDetails(); break;
            case 'INDICES': return this.renderIndices(); break;
            case 'NAMES':   return this.renderNames();   break;
        }
    }

    renderButtons() {
        const { show: sShow } = this.state;

        return (
            <div className="ui field buttons">
                <div className={ClassNames("ui button", {disabled: sShow == 'DETAILS' || !sShow})} onClick={this.openDetails}>D</div>
                <div className={ClassNames("ui button", {disabled: sShow == 'INDICES'})} onClick={this.openIndices}>I</div>
                <div className={ClassNames("ui button", {disabled: sShow == 'NAMES'})}   onClick={this.openNames}>N</div>
            </div>
        )
    }

    renderNameShort() {
        const { column: oColumn } = this.state;

        return (
            <div className="field">
                <input ref="name_short"  name="name_short"       value={oColumn.name_short}       placeholder="Short Name"       onChange={this.updateProperty} onKeyDown={this.onKeyDown} />
            </div>
        );
    }

    renderDetails() {
        const { column: oColumn } = this.state;

        return (
            <form key="details" className="ui form" onSubmit={oEvent => oEvent.preventDefault()}>
                <div className="ui seven fields">
                    {this.renderNameShort()}
                    {this.renderButtons()}

                    <div className="field">
                        <input ref="type"        name="type"       value={oColumn.type}       placeholder="Type"      onChange={this.updateProperty} />
                    </div>

                    {this.renderLengthOrValues()}

                    <div className="field">
                        <input ref="default"     name="default"    value={oColumn.default}    placeholder="Default"   onChange={this.updateProperty} />
                    </div>

                    <div className="field">
                        <input ref="null"        name="null"       value={oColumn.null}       placeholder="Nullable"  onChange={this.updateProperty} />
                    </div>
                </div>
            </form>
        );
    }

    renderLengthOrValues() {
        const { column: oColumn } = this.state;

        let bEnum = false;
        if (bEnum) {
            return (
                <div className="field">
                    <input ref="values"        name="values"       value={oColumn.values}       placeholder="Enum Values"       onChange={this.updateProperty} />
                </div>
            );
        }

        return (
            <div className="field">
                <input ref="length"        name="length"       value={oColumn.length}       placeholder="Length"       onChange={this.updateProperty} />
            </div>
        );
    }

    renderIndices() {
        const { column: oColumn } = this.state;

        return (
            <form key="indices" className="ui form" onSubmit={oEvent => oEvent.preventDefault()}>
                <div className="ui seven fields">
                    {this.renderNameShort()}
                    {this.renderButtons()}

                    <div className="field">
                        <div ref="primary" className="ui checkbox">
                            <input type="checkbox" tabIndex="0" className="hidden" checked={oColumn.primary == 1} />
                            <label>Primary Key</label>
                        </div>
                    </div>
                    <div className="field">
                        <div ref="auto_increment" className="ui checkbox">
                            <input type="checkbox" tabIndex="0" className="hidden" checked={oColumn.auto_increment == 1} />
                            <label>Auto Increment</label>
                        </div>
                    </div>
                    <div className="field">
                        <div ref="unique" className="ui checkbox">
                            <input type="checkbox" tabIndex="0" className="hidden" checked={oColumn.unique == 1} />
                            <label>Unique Index</label>
                        </div>
                    </div>
                </div>
            </form>
        )
    }

    renderNames() {
        const { column: oColumn } = this.state;

        return (
            <form key="names" className="ui form" onSubmit={oEvent => oEvent.preventDefault()}>
                <div className="ui seven fields">
                    {this.renderNameShort()}
                    {this.renderButtons()}

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

    prepCheckboxes() {
        for (let sField of ['primary', 'auto_increment', 'unique']) {
            $(this.refs[sField]).checkbox({
                onChecked:   oEvent => this.checkedProperty(sField, true),
                onUnchecked: oEvent => this.checkedProperty(sField, false),
            });
        }
    }

    componentDidMount() {
        this.stealFocus();
        this.prepCheckboxes();

    }

    componentDidUpdate() {
        this.stealFocus();
        this.prepCheckboxes();
    }

    checkedProperty = (sProperty, bChecked) => {
        this.CURSORS.column.merge({[sProperty]: bChecked ? 1 : 0});
    };

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

    openDetails = () => {
        this.CURSORS.show.set('DETAILS');
    };

    openIndices = () => {
        this.CURSORS.show.set('INDICES');
    };

    openNames = () => {
        this.CURSORS.show.set('NAMES');
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