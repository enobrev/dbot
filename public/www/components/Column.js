"use strict";

import React, { PropTypes } from "react";
import ClassNames from 'classnames';
import pluralize from 'pluralize';
import BaobabComponent from './BaobabComponent';
import Checkbox from './Checkbox';
import Data from '../js/Data';
import LocalData from '../js/LocalData';

export default class Column extends BaobabComponent {
    static propTypes = {
        id: PropTypes.string
    };

    static defaultProps = {};

    stateQueries() {
        return {
            column:        {
                cursor: [ 'local', 'columns', this.props.id ],
                setState: oState => {
                    this.addCursor('show_names', [ 'state', 'www', 'table', oState.column.table_id, 'open' ]);
                }
            },
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
            column_types: {
                cursor:       [ 'local', 'column_types' ],
                invokeRender: false,
                setState:     oState => {
                    oState.types = Data.sortObjectBy(oState.column_types, 'name');
                    oState.type_date_time = Data.objectFilterFirst(oState.column_types, oType => oType.name == 'DateTime');
                    oState.type_enum      = Data.objectFilterFirst(oState.column_types, oType => oType.name == 'Enum');
                    oState.type_integer   = Data.objectFilterFirst(oState.column_types, oType => oType.name == 'Integer');
                    oState.type_id        = Data.objectFilterFirst(oState.column_types, oType => oType.name == 'Id');
                }
            },
            focus:        {
                cursor:   [ 'state', 'www', 'focus' ],
                setState: oState => oState.stealFocus = oState.focus
                                                     && oState.focus.type == 'column'
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
            let oRef = this.refs[oState.focus.ref] || this.refs.name_short;
            if (oRef) {
                oRef.focus();
            }
        }
    };

    initDropdowns() {
        $(this.refs.type).dropdown({onChange: this.updateType.bind(this)});
        $(this.refs.defaultDropdown).dropdown({onChange: this.updateDefault.bind(this)});
    }

    componentDidMount() {
        this.stealFocus(this.state);
        this.initDropdowns();
    }

    componentDidUpdate() {
        this.stealFocus(this.state);
        this.initDropdowns();
    }

    render() {
        const { show_names: bShow } = this.state;

        if (bShow) {
            return this.renderNames();
        }

        return this.renderDetails();
    }

    renderNameShort() {
        const { column: oColumn } = this.state;

        return (
            <div className="three wide field">
                <input ref="name_short"  name="name_short"       value={oColumn.name_short}       placeholder="Short Name"       onChange={this.updateProperty} onKeyDown={this.onKeyDown} />
            </div>
        );
    }

    renderDetails() {
        const { column: oColumn, types: aTypes, type_integer: oTypeInt, type_id: oTypeId } = this.state;

        return (
            <form key="details" className="ui form" onSubmit={oEvent => oEvent.preventDefault()}>
                <div className="ui eight fields">
                    {this.renderNameShort()}

                    <div className="field">
                        <select ref="type" name="type" className="ui fluid search dropdown" value={oColumn.type_id}>
                            <option value={null}>Type</option>
                            {aTypes.map(oType => <option key={oType.id} value={oType.id}>{oType.name}</option>)}
                        </select>
                    </div>

                    {this.renderLengthOrValues()}
                    {this.renderDefault()}

                    <Checkbox name="nullable"       checked={oColumn.nullable}       label="Nullable"   onChange={this.checkedProperty} />
                    <Checkbox name="primary"        checked={oColumn.primary}        label="Primary"    onChange={this.checkedProperty} />
                    { oColumn.primary && <Checkbox name="auto_increment" checked={oColumn.auto_increment} label="AutoInc"    onChange={this.checkedProperty} />}
                    { (oColumn.type_id == oTypeId.id || oColumn.type_id == oTypeInt.id)
                        && <Checkbox name="unsigned"       checked={oColumn.unsigned}       label="Unsigned"   onChange={this.checkedProperty} />}
                </div>
            </form>
        );
    }

    renderLengthOrValues() {
        const { column: oColumn, type_enum: oTypeEnum } = this.state;

        if (oColumn.type_id == oTypeEnum.id) {
            return (
                <div className="field">
                    <input ref="values" name="values" value={oColumn.values} placeholder="Enum Values" onChange={this.updateProperty} />
                </div>
            );
        }

        return (
            <div className="field">
                <input ref="length"    name="length"  value={oColumn.length} placeholder="Length"       onChange={this.updateProperty} />
            </div>
        );
    }

    renderDefault() {
        const { column: oColumn, type_enum: oTypeEnum } = this.state;

        if (oColumn.type_id == oTypeEnum.id) {
            let aValues = oColumn.values ? oColumn.values.split(',').map(sValue => sValue.trim()) : [];

            if (oColumn.nullable) {
                aValues.unshift('NULL')
            }

            return (
                <div className="field">
                    <select ref="defaultDropdown" name="default" className="ui fluid search dropdown" value={oColumn.default}>
                        {aValues.map((sValue, iIndex) => <option key={iIndex} value={sValue}>{sValue}</option>)}
                    </select>
                </div>
            );
        }

        return (
            <div className="field">
                <input ref="default"     name="default"    value={oColumn.default}    placeholder="Default"   onChange={this.updateProperty} />
            </div>
        );
    }

    renderNames() {
        const { column: oColumn } = this.state;

        return (
            <form key="names" className="ui form" onSubmit={oEvent => oEvent.preventDefault()}>
                <div className="ui six fields">
                    {this.renderNameShort()}

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

    checkedProperty = (sProperty, bChecked) => {
        this.CURSORS.column.merge({[sProperty]: bChecked});
    };

    updateProperty = oEvent => {
        const {
            table:          oTable,
            type_date_time: oTypeDateTime,
            type_id:        oTypeId
        } = this.state;

        let oMerge;

        switch(oEvent.target.name) {
            case 'name_short':
                oMerge = {
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


                if (oMerge.name_short.match(/date_/)) {
                    oMerge.type_id = oTypeDateTime.id;
                    if (oTypeDateTime.nullable) {
                        oMerge.nullable = oTypeDateTime.nullable;
                    }
                } else if (oMerge.name_short.match(/_id$/)) {
                    oMerge.type_id = oTypeId.id;

                    if (oTypeId.unsigned) {
                        oMerge.unsigned = oTypeId.unsigned;
                    }

                    if (oTypeId.nullable) {
                        oMerge.nullable = oTypeId.nullable;
                    }
                }

                this.CURSORS.column.merge(oMerge);
                break;

            default:
                this.CURSORS.column.merge({[oEvent.target.name]: oEvent.target.value});
                break;

        }
    };

    updateType(sValue) {
        const { column_types: oTypes } = this.state;

        let oMerge = {
            type_id: sValue
        };

        if (!oMerge.type_id) {
            this.CURSORS.column.merge(oMerge);
        } else {
            const oType = oTypes[oMerge.type_id];

            if (oType.length) {
                oMerge.length = oType.length;
            }

            if (oType.unsigned) {
                oMerge.unsigned = oType.unsigned;
            }

            if (oType.nullable) {
                oMerge.nullable = oType.nullable;
            }

            this.CURSORS.column.merge(oMerge);
        }
    };

    updateDefault(sValue) {
        this.CURSORS.column.merge({default: sValue});
    }

    onKeyDown = oEvent => {
        const {
            column:         oColumn,
            table:          oTable,
            table_columns:  aColumns,
            column_index:   iIndex
        } = this.state;

        const iNameShort = oColumn.name_short ? oColumn.name_short.length : 0;

        let sFocusCategory = 'column';
        let sFocusId;

        switch(oEvent.keyCode) {
            case 13: // ENTER
                if (iNameShort) {
                    if (aColumns.length > iIndex + 1) {
                        sFocusId = aColumns[ iIndex + 1 ].id;
                    } else {
                        let oNewColumn = LocalData.newColumn(oTable.id);
                        this.CURSORS.column.up().set(oNewColumn.id, oNewColumn);
                        sFocusId = oNewColumn.id;
                    }
                } else {
                    console.log('TODO: Check for Next Table and switch to there if we are not at the bottom of the project');

                    let oNewTable = LocalData.newTable(oTable.project_id);

                    this.CURSORS.column.unset();
                    this.CURSORS.tables.set(oNewTable.id, oNewTable);
                    sFocusCategory = 'table';
                    sFocusId       = oNewTable.id;
                }
                break;

            case 8: // BACKSPACE
                if (iNameShort == 0) {
                    this.CURSORS.column.unset();

                    // Remember that aColumns is outdated at this point because that "unset" has not taken yet
                    if (aColumns.length > 1) {
                        if (iIndex < aColumns.length - 1) {
                            sFocusId = aColumns[ iIndex + 1 ].id;
                        } else {
                            sFocusId = aColumns[ iIndex - 1 ].id;
                        }
                    } else {
                        sFocusCategory = 'table';
                        sFocusId       = oTable.id;
                    }
                }
                break;


        }

        if (sFocusId) {
            this.CURSORS.focus.set({
                type:  sFocusCategory,
                id:    sFocusId,
                ref:   oEvent.target.name
            });
        }
    }
}