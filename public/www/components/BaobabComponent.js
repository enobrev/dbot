"use strict";

import React, {PropTypes} from "react";
import Data from '../js/Data';
import UUID from '../js/UUID';
import shallowCompare from 'react-addons-shallow-compare'

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
        this.oData    = {};
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
        let aChangedPath = solveUpdate(oEvent.data.paths, this._aPaths);
        if (aChangedPath !== false) {
            this.onWatcherData(oEvent);
        }
    };

    onWatcherData = oEvent => {
        if (!this.bWatch) {
            return;
        }

        let oState   = this._getData();
        let oAfter   = {};
        let bChanged = false;
        //let aChanged = [];

        for (let sKey in oState) {
            if (oState[sKey] != this.oData[sKey]) { // HAS TO BE != instead of !==.  See Baobab::helpers::solveUpdate
                if (this._iPassive && this._oPassive[sKey] !== undefined) {
                    // Do noy announce the changes of passive cursors
                } else {
                    bChanged = true;
                    //aChanged.push(sKey);
                }

                if (this._iAdjusted && this._oAdjusted[sKey] !== undefined) {
                    this._oAdjusted[sKey].adjust(oState);

                    // Passive Cursor, but we have a change to report
                    if (this._iPassive && this._oPassive[sKey] !== undefined) {
                        bChanged = true;
                        //aChanged.push(sKey);
                    }
                }

                if (this._iAfter && this._oAfter[sKey] !== undefined) {
                    oAfter[sKey] = this._oAfter[sKey];
                }
            }
        }

        if (bChanged) {
            //console.log('CHANGED', this.constructor.name, aChanged, oEvent);

            let fDone  = () => Object.keys(oAfter).map(sKey => oAfter[sKey].after(oState));
            this.oData = oState;

            if (oEvent) { // Handler
                this.setState(oState, fDone);
            } else {      // Virgin
                this.state = oState;
                fDone();
            }
        }
    };

    componentWillMount() {
        this.bWatch = true;
    }

    componentWillUnmount() {
        this.bWatch = false;
    }

    shouldComponentUpdate(oNextProps, oNextState) {
        return shallowCompare(this, oNextProps, oNextState);
    }

    onBoundInputChange = oEvent => {
        this.oCursors[oEvent.target.name].set(oEvent.target.value);
    };

    _refresh() {
        this._oPaths    = {};
        this._oAdjusted = {};
        this._iAdjusted = 0;
        this._oAfter    = {};
        this._iAfter    = 0;
        this._oPassive  = {};
        this._iPassive  = 0;
        this.oCursors   = {};

        Object.keys(this._oQueries).map(sKey => {
            let mQuery    = this._oQueries[sKey];
            let bIsPath   = Array.isArray(mQuery);
            let sPath     = bIsPath ? mQuery : mQuery.path;

            if (!bIsPath) {
                if (typeof mQuery.adjust == 'function') {
                    this._oAdjusted[ sKey ] = mQuery;
                    this._iAdjusted++;
                }

                if (typeof mQuery.after == 'function') {
                    this._oAfter[ sKey ] = mQuery;
                    this._iAfter++;
                }

                // Only Watch Passive Paths
                if (mQuery.passive !== undefined && mQuery.passive) {
                    this._oPassive[ sKey ] = 1;
                    this._iPassive++;
                }
            }
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