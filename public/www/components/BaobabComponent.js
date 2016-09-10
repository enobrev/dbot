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
        this._oQueries = this.stateQueries();
        this._refresh();

        this.onWatcherData();
        Data.Base.on('update', this._treeUpdate);
    }

    addCursor(sKey, oQuery) {
        this._oQueries[sKey] = oQuery;
        this._refresh();
    }

    removeCursor(sKey) {
        delete this._oQueries[sKey];
        this._refresh();
    }

    _treeUpdate = oEvent => {
        let aPath = solveUpdate(oEvent.data.paths, this._aPaths);

        if (aPath !== false) {
            oEvent.solved = aPath;
            this.onWatcherData(oEvent);
        }
    };

    onWatcherData = oEvent => {
        if (!this.bWatch) {
            return;
        }

        if (oEvent) {
            console.log(this.constructor.name, 'onWatcherData', oEvent.solved, oEvent.data.paths, oEvent.data.transaction);
        } else {
            console.log(this.constructor.name, 'onWatcherData.init');
        }

        let oState   = Object.assign({}, this.state, this._getData());
        let oChanged = {};

        Object.keys(oState).map(sKey => {
            if (oState[sKey] != this.state[sKey]) { // HAS TO BE != instead of !==.  See Baobab::helpers::solveUpdate
                oChanged[sKey] = {
                    from: this.state[sKey],
                    to:   oState[sKey]
                };
                this.adjustStateFromCursor(sKey, oState);
            }
        });

        let aChanged = Object.keys(oChanged);
        let fDone = () => aChanged.map(sKey => this.onAfterCursorData(sKey, oState[sKey]));

        console.log('CHANGED:', oChanged);

        if (aChanged.length) {
            if (oEvent) { // Handler
                this.setState(oState, fDone);
            } else {      // Virgin
                this.state = oState;
                fDone();
            }
        }
    };

    adjustStateFromCursor(sKey, oPreviousState) { // OVERRIDE ME

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
    };

    _refresh() {
        this._oPaths  = {};
        this.oCursors = {};

        Object.keys(this._oQueries).map(sKey => {
            let mQuery = this._oQueries[sKey];
            let sPath  = Array.isArray(mQuery) ? mQuery : mQuery.path;

            this._oPaths[sKey]  = sPath;
            this.oCursors[sKey] = Data.Base.select(sPath);
        });

        this._aPaths  = Object.values(this._oPaths);
        this._getData = Data.Base.project.bind(Data.Base, this._oPaths);
    }
}


/**
 * Function determining whether some paths in the tree were affected by some
 * updates that occurred at the given paths. This helper is mainly used at
 * cursor level to determine whether the cursor is concerned by the updates
 * fired at tree level.
 *
 * NOTES: 1) If performance become an issue, the following threefold loop
 *           can be simplified to a complex twofold one.
 *        2) A regex version could also work but I am not confident it would
 *           be faster.
 *        3) Another solution would be to keep a register of cursors like with
 *           the monkeys and update along this tree.
 *
 * @param  {array} affectedPaths - The paths that were updated.
 * @param  {array} comparedPaths - The paths that we are actually interested in.
 * @return {boolean}             - Is the update relevant to the compared
 *                                 paths?
 */

function solveUpdate(affectedPaths, comparedPaths) {
    let i, j, k, l, m, n, p, c, s;

    // Looping through possible paths
    for (i = 0, l = affectedPaths.length; i < l; i++) {
        p = affectedPaths[i];

        if (!p.length)
            return p;

        // Looping through logged paths
        for (j = 0, m = comparedPaths.length; j < m; j++) {
            c = comparedPaths[j];

            if (!c || !c.length)
                return p;

            // Looping through steps
            for (k = 0, n = c.length; k < n; k++) {
                s = c[k];

                // If path is not relevant, we break
                // NOTE: the '!=' instead of '!==' is required here!
                if (s != p[k])
                    break;

                // If we reached last item and we are relevant
                if (k + 1 === n || k + 1 === p.length)
                    return p;
            }
        }
    }

    return false;
}