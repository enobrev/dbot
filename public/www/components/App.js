"use strict";

import React, { PropTypes } from "react";
import BaobabComponent from '../BaobabComponent';

export default class App extends BaobabComponent {
    static propTypes = {
        prop: PropTypes.string
    };

    static defaultProps = {};

    stateQueries() {
        return {
            query: [ 'local', 'some_data' ]
        }
    }

    adjustStateFromCursor(sKey, oData) {
        let oState = super.adjustStateFromCursor(sKey, oData);

        switch (sKey) {
            case 'query':
                oState.something = oState[ sKey ] ? 'whatevers' : null;
                break;
        }

        return oState;
    }

    render() {
        return null;
    }
}