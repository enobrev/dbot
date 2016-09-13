"use strict";

import React, { PropTypes } from "react";
import pluralize from 'pluralize';

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
            table:         [ 'local', 'tables', this.props.id ],
            open:          [ 'state', 'www', 'table', this.props.id, 'open' ],
            columns:       {
                cursor:       [ 'local', 'columns' ],
                invokeRender: true,
                setState:     oState => oState.table_columns = Object.values(oState.columns).filter(oTable => oTable.table_id == this.props.id)
            },
            table_columns: {
                setState: oState => oState.show = oState.table_columns.length > 0
            },
            focus:         {
                cursor:   [ 'state', 'www', 'focus' ],
                setState: oState => oState.stealFocus = oState.focus == 'table-' + oState.type.id,
                onUpdate: oState => oState.stealFocus && this.refs.input && this.refs.input.focus()
            }
        }
    }

    componentDidMount() {
        if (this.state.stealFocus) {
            this.refs.name.focus();
        }
    }

    render() {
        return (
            <div className="ui segment">
                {this.renderForm()}
                {this.renderColumns()}
            </div>
        )
    }

    renderForm() {
        const { open: bOpen } = this.state;

        return bOpen
            ? this.renderOpen()
            : this.renderClosed();
    }

    renderColumns() {
        const {
            table_columns: aColumns,
            show:          bShow
        } = this.state;

        if (!bShow) {
            return null;
        }

        return (
            <div className="ui segment">
                {aColumns.map(oTable => <Column key={oTable.id} id={oTable.id} />)}
            </div>
        );
    }

    renderClosed() {
        const { table: oTable } = this.state;

        return (
            <form className="ui form" onSubmit={oEvent => oEvent.preventDefault()}>
                <div className="ui seven fields">
                    <div className="field">
                        <input ref="name" name="name" value={oTable.name} placeholder="Name" onChange={this.updateProperty} onKeyDown={this.onKeyDown} />
                    </div>
                    <div className="ui icon button" onClick={this.toggleOpen}><i className="plus square outline icon" /></div>
                </div>
            </form>
        );
    }

    renderOpen() {
        const { table: oTable } = this.state;

        return (
            <form className="ui form" onSubmit={oEvent => oEvent.preventDefault()}>
                <div className="ui seven fields">
                    <div className="field">
                        <input ref="name" name="name" value={oTable.name} placeholder="Name" onChange={this.updateProperty} onKeyDown={this.onKeyDown} />
                    </div>
                    <div className="ui icon button" onClick={this.toggleOpen}><i className="minus square outline icon" /></div>
                    <div className="field">
                        <input ref="name_singular"    name="name_singular"    value={oTable.name_singular}    placeholder="Singular"         onChange={this.updateProperty} />
                    </div>
                    <div className="field">
                        <input ref="name_plural"      name="name_plural"      value={oTable.name_plural}      placeholder="Plural"           onChange={this.updateProperty} />
                    </div>
                    <div className="field">
                        <input ref="display_singular" name="display_singular" value={oTable.display_singular} placeholder="Singular Display" onChange={this.updateProperty} />
                    </div>
                    <div className="field">
                        <input ref="display_plural"   name="display_plural"   value={oTable.display_plural}   placeholder="Plural Display"   onChange={this.updateProperty} />
                    </div>
                    <div className="field">
                        <input ref="class_singular"   name="class_singular"   value={oTable.class_singular}   placeholder="Singular Class"   onChange={this.updateProperty} />
                    </div>
                    <div className="field">
                        <input ref="class_plural"     name="class_plural"     value={oTable.class_plural}     placeholder="Plural Class"     onChange={this.updateProperty} />
                    </div>
                </div>
            </form>
        )
    }

    updateProperty = oEvent => {
        if (oEvent.target.name == 'name') {
            let oMerge = {
                name: oEvent.target.value
            };

            oMerge.name_singular    = pluralize.singular(oMerge.name);
            oMerge.name_plural      = pluralize.plural(oMerge.name);
            oMerge.display_singular = oMerge.name_singular.replace(/_/g, ' ').replace(/\b\w/g, sLetter => sLetter.toUpperCase());
            oMerge.display_plural   = oMerge.name_plural.replace(/_/g, ' ').replace(/\b\w/g,   sLetter => sLetter.toUpperCase());
            oMerge.class_singular   = oMerge.display_singular.replace(/\s/g, '');
            oMerge.class_plural     = oMerge.display_plural.replace(/\s/g, '');

            this.CURSORS.table.merge(oMerge);
        } else {
            this.CURSORS.table.merge({[oEvent.target.name]: oEvent.target.value});
        }
    };

    toggleOpen = () => {
        this.CURSORS.open.apply(bValue => !bValue);
    };

    onKeyDown = oEvent => {
        const {
                  table_columns: aColumns,
                  table:         oTable
              } = this.state;

        switch(oEvent.keyCode) {
            case 13: // ENTER
                if (aColumns.length) {
                    this.CURSORS.focus.set('column-' + aColumns[0].id);
                } else {
                    let oNewColumn = LocalData.newColumn(oTable.id);
                    this.CURSORS.columns.set(oNewColumn.id, oNewColumn);
                    this.CURSORS.focus.set('column-' + oNewColumn.id);
                }
                break;

            case 8: // BACKSPACE
                if (!oTable.name || oTable.name.length == 0) {
                    this.CURSORS.table.unset();

                    console.log('TODO: Focus on Previous Table or Project');
                }
                break;
        }
    }
}