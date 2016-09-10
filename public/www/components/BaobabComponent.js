"use strict";

import React, {PropTypes} from "react";
import Data from '../js/Data';

/**
 * Components should extend this component.  The extending components should override the stateQueries method.
 * This method returns an object holding Baobab queries, which affect the component render.  Consider it the
 * State of the Component
 *
 *
 * Example:
 *

    stateQueries() {
        const aProjectId    = ['state', 'url', 'project_id'];

        const sProjectId    = Data.Base.get(aProjectId);
        const iPriceId      = Data.filterFirst(Data._.prices, oPrice => oPrice.type == 'Line').id;

        return {
            focus_id:          ['state', 'editor', 'sideBar', 'focus_id'],
            project_id:        aProjectId,
            project:           [...Data._.projects, sProjectId],
            linePrice:         [...Data._.prices, iPriceId],
            project_print_ids: Data._.project_prints
        }
    }

 * An optional method to override is the adjustStateFromCursor Method.  This method is essentially a hook that
 * allows you to modify the incoming data before it is set into the current component's state
 *
 * Example:
 *

    adjustStateFromCursor(sKey, mNewData, oPreviousState) {
        let oState = super.adjustStateFromCursor(sKey, mNewData);

        switch(sKey) {
            case 'project_print_ids':
                const {
                    project_id: sProjectId,
                    linePrice:  oPricePerExtraLine
                } = this.state;

                oState[sKey]      = Object.keys(Data.objectFilter(oData, oPrint => oPrint.project_id == sProjectId));
                oState.count      = oState[sKey].length;
                oState.next_price = oState.count < oPricePerExtraLine.minimum ? 'FREE' : '$' + oPricePerExtraLine.amount;
                break;
        }

        return oState;
    }

 * Once these methods are in place, all your other methods should load their data from this.state.  In order to update the
 * current component's state, you should _always_ update the Baobab Database.  If you have local state to manage, it's a good
 * idea to track that in your Baobab database as well.
 *
 *
 * All your cursors are stored in this.oCursors, which are Baobab Cursors.  So if you want to update something...

    this.oCursors.whataver.set('someValue');

 * or

    this.oCursors.something.merge({something: 'else'});

 * Updating the cursor will re-render the current component because the current component's state will have changed.  As will
 * any other BaobabComponent that has been watching the same data.
 */

export default class BaobabComponent extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.watch();
    }

    stateQueries() {
        return {}
    }

    watch() {
        this.oCursors = {};
        this.state    = {};

        this.bWatch   = true;
        this.oQueries = this.stateQueries();

        this.oWatcher = Data.Base.watch(this.oQueries);
        this.oCursors = this.oWatcher.getCursors();

        this.onWatcherData();
        this.oWatcher.on('update', this.onWatcherData);

        this.queryAPI();
    }

    queryAPI() {

    }

    addCursor(sKey, oQuery) {
        this.oQueries[sKey] = oQuery;
        this.oWatcher.refresh(this.oQueries);
    }

    removeCursor(sKey) {
        delete this.oQueries[sKey];
        this.oWatcher.refresh(this.oQueries);
    }

    onWatcherData = oEvent => {
        if (!this.bWatch) {
            return;
        }

        let oState   = Object.assign({}, this.state, this.oWatcher.get());
        let aChanged = [];

        Object.keys(oState).map(sKey => {
            if (oState[sKey] != this.state[sKey]) { // HAS TO BE != instead of !==.  See Baobab::helpers::solveUpdate
                aChanged.push(sKey);
                oState = Object.assign(oState, this.adjustStateFromCursor(sKey, oState[sKey], oState));
            }
        });

        let fDone = () => aChanged.map(sKey => this.onAfterCursorData(sKey, oState[sKey]));

        // console.log('CHANGED:', aChanged);

        if (aChanged.length) {
            if (oEvent) { // Handler
                this.setState(oState, fDone);
            } else {      // Virgin
                this.state = oState;
                fDone();
            }
        }
    };

    adjustStateFromCursor(sKey, mNewData, oPreviousState) { // OVERRIDE ME
        return {
            [sKey]: mNewData
        };
    };

    onAfterCursorData(sKey, mData) { // OVERRIDE ME

    };

    componentWillMount() {
        this.bWatch = true;
        // TODO: Attach Watchers
    }

    componentWillUnmount() {
        this.bWatch = false;
        // TODO: Release Watchers
    }

    shouldComponentUpdate(oNextProps, oNextState) {
        return !Object.is(oNextProps, this.props)
            || !Object.is(oNextState, this.state);
    }

    onBoundInputChange = oEvent => {
        this.oCursors[oEvent.target.name].set(oEvent.target.value);
    }
}