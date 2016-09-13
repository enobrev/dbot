"use strict";

import React, { PropTypes } from "react";

import BaobabComponent from './BaobabComponent';
import Checkbox from './Checkbox';

import LocalData from '../js/LocalData';

export default class Type extends BaobabComponent {
    static propTypes = {
        id: PropTypes.string
    };

    static defaultProps = {};

    stateQueries() {
        return {
            type:         [ 'local', 'column_types', this.props.id ],
            column_types: {
                cursor:       [ 'local', 'column_types' ],
                invokeRender: false,
                setState:     oState => oState.types = Object.values(oState.column_types)
            },
            types:        {
                invokeRender: true,
                setState:     oState =>  oState.type_index = oState.types.findIndex(oType => oType.id == this.props.id)
            },
            focus:        {
                cursor:   [ 'state', 'www', 'focus' ],
                setState: oState => oState.stealFocus = oState.focus == 'type-' + oState.type.id,
                onUpdate: oState => oState.stealFocus && this.refs.name && this.refs.name.focus()
            }
        }
    }

    componentDidMount() {
        if (this.state.stealFocus) {
            this.refs.name.focus();
        }
    }

    render() {
        const { type: oType } = this.state;

        return (
            <form className="ui form" onSubmit={oEvent => oEvent.preventDefault()}>
                <div className="ui eight fields">
                    <div className="field">
                        <input ref="name"           name="name"           value={oType.name}            placeholder="Name"           onChange={this.updateProperty} onKeyDown={this.onKeyDown} />
                    </div>
                    <div className="field">
                        <input ref="php"            name="php"            value={oType.php}             placeholder="PHP"            onChange={this.updateProperty} />
                    </div>
                    <div className="field">
                        <input ref="mysql"          name="mysql"          value={oType.mysql}           placeholder="MySQL"          onChange={this.updateProperty} />
                    </div>
                    <div className="field">
                        <input ref="length"         name="length"         value={oType.length}          placeholder="Length"         onChange={this.updateProperty} />
                    </div>

                    <Checkbox name="unsigned"        checked={oType.unsigned}       label="Unsigned"       onChange={this.checkedProperty} />
                    <Checkbox name="nullable"        checked={oType.nullable}       label="Nullable"       onChange={this.checkedProperty} />
                    <Checkbox name="primary"         checked={oType.primary}        label="Primary"        onChange={this.checkedProperty} />
                    <Checkbox name="auto_increment"  checked={oType.auto_increment} label="Auto Increment" onChange={this.checkedProperty} />

                </div>
            </form>
        )
    }

    checkedProperty = (sProperty, bChecked) => {
        this.CURSORS.type.merge({[sProperty]: bChecked});
    };

    updateProperty = oEvent => {
        let sValue = oEvent.target.value;

        if (oEvent.target.name == 'mysql') {
            sValue = sValue.toUpperCase();
        }

        this.CURSORS.type.merge({[oEvent.target.name]: sValue});
    };

    onKeyDown = oEvent => {
        const {
            type:       oType,
            types:      aTypes,
            type_index: iIndex
        } = this.state;

        const iName = oType.name ? oType.name.length : 0;

        switch(oEvent.keyCode) {
            case 13: // ENTER
                if (iName) {
                    if (aTypes.length > iIndex + 1) {
                        this.CURSORS.focus.set('type-' + aTypes[ iIndex + 1 ].id);
                    } else {
                        let oNewType = LocalData.newColumnType();
                        this.CURSORS.type.up().set(oNewType.id, oNewType);
                        this.CURSORS.focus.set('type-' + oNewType.id);
                    }
                }
                break;

            case 8: // BACKSPACE
                if (iName == 0) {
                    this.CURSORS.type.unset();

                    // Remember that aTypes is outdated at this point because that "unset" has not taken yet
                    if (aTypes.length > 1) {
                        if (iIndex < aTypes.length - 1) {
                            this.CURSORS.focus.set('type-' + aTypes[ iIndex + 1 ].id);
                        } else {
                            this.CURSORS.focus.set('type-' + aTypes[ iIndex - 1 ].id);
                        }
                    }
                }
                break;


        }
    }
}