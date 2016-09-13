"use strict";

import async from 'async';
import Baobab from 'baobab';
import LocalForage from 'localforage';

import isEquivalent from './isEquivalent';
import API from './API';

LocalForage.config({
    name:    'DBot',
    version: '2.0'
});

export default class Data {
    static Base = new Baobab({
        server: {
            columns:      {},
            column_types: {},
            notes:        {},
            projects:     {},
            tables:       {}
        },
        local:  {
            columns:      {},
            column_types: {},
            notes:        {},
            projects:     {},
            tables:       {}
        },
        state:  {
            www: {
                tab:       'projects',
                url_state: {},
                component: null,
                focus:     null,
                table:     {},
                column:    {}
            }
        },
        props: {}
    });

    static has(aPath) {
        try {
            return Data.Base.select('local').select(aPath).exists();
        } catch (e) {
            return false;
        }
    }

    static isDiff(aPath) {
        if (['server', 'local'].indexOf(aPath[0]) > -1) {
            throw new Error('Diff Path should not include local or server as prefix');
        }

        let oServer = Data.Base.select('server').select(aPath).get();
        let oLocal  = Data.Base.select('local').select(aPath).get();

        return !isEquivalent(oServer, oLocal);
    }

    static replaceResponse(oResponse) {
        let oMerge = {};
        for (let sKey in oResponse) {
            if (sKey.charAt(0) != '_') {
                oMerge[sKey] = oResponse[sKey];
            }
        }

        Data.Base.set({
            server: oMerge,
            local:  oMerge,
            state:  Data.Base.get('state')
        });
    }

    static mergeResponseDirectly(oError, oResponse) {
        if (oError) {
            console.error(oError);
        } else {
            Data.mergeResponse(oResponse);
        }
    }

    static mergeResponse(oResponse) {
        if (!oResponse) {
            return;
        }

        let oMerge = {};
        for (let sKey in oResponse) {
            if (sKey.charAt(0) != '_') {
                oMerge[sKey] = oResponse[sKey];
            }
        }

        Data.Base.deepMerge({
            server: oMerge,
            local:  oMerge
        });
    }

    static sortedArray(sTable, oData) {
        let aOutput = [];
        let aSorts  = Data.Base.get(['local', 'sorts', sTable]);
        aSorts.forEach(iIndex => aOutput.push(oData[iIndex]));

        return aOutput;
    }

    static objectFilter(oObject, fFilter = () => true) {
        let oData = {};

        Object.keys(oObject).forEach(sId => {
            if (fFilter(oObject[sId])) {
                oData[sId] = oObject[sId];
            }
        });

        return oData;
    }

    static filter(aPath, fFilter) {
        return Data.objectFilter(Data.Base.get(aPath), fFilter);
    }

    static filterCount(aPath, fFilter) {
        let iCount    = 0;
        let oPathData = Data.Base.get(aPath);
        if (oPathData) {
            Object.values(oPathData).forEach(oItem => {
                if (fFilter(oItem)) {
                    iCount++;
                }
            });
        }

        return iCount;
    }

    static filterFirst(aPath, fFilter) {
        let oPathData = Data.Base.get(aPath);
        if (oPathData) {
            return Data.objectFilterFirst(oPathData, fFilter);
        }
    }

    static objectFilterFirst(oObject, fFilter) {
        let aPathData = Object.values(oObject);
        for (let oItem of aPathData) {
            if (fFilter(oItem)) {
                return oItem;
            }
        }
    }

    static sortObjectBy(oData, sField) {
        if (!oData) {
            return [];
        }

        let aOutput = Object.values(oData);

        aOutput.sort((a, b) => {
            if (a[sField] < b[sField]) {
                return -1;
            } else if (a[sField] > b[sField]) {
                return 1;
            }

            return 0;
        });

        return aOutput;
    }

    static sortedBy(sTable, sField) {
        return Data.sortObjectBy(Data.Base.get(['local', sTable]), sField);
    }

    static getThemeFontStyle(oTheme, sPlacement, nMultiplier = 1) {
        let oFont;
        let iFontId = oTheme[sPlacement + '_font_id'];
        if (iFontId) {
            oFont = Data.Base.get(['local', 'fonts', iFontId]);

            if (!oFont) {
                console.error('Missing Data for Font', iFontId);
            }
        }

        return {
            fontFamily: oFont                              ? '"' + oFont.name_css + '"'                      : 'sans-serif',
            fontSize:   oTheme['font_size_' + sPlacement]  ? oTheme['font_size_' + sPlacement] * nMultiplier : 16 * nMultiplier,
            color:      oTheme['color_text_' + sPlacement] ? '#' + oTheme['color_text_' + sPlacement]        : '#000000'
        };
    }

    static getThemeFontStyles(oTheme, nMultiplier = 1) {
        let oFontStyles = {};
        for (let sPlacement of this.getThemePlacements()) {
            oFontStyles[sPlacement] = this.getThemeFontStyle(oTheme, sPlacement, nMultiplier);
        }

        return oFontStyles;
    }

    static getThemePlacements() {
        return ['header', 'subheader', 'title', 'tip'];
    }

    static getPlaceTypesTree() {
        let oData = JSON.parse(JSON.stringify(Data.Base.get(['local', 'place_types']))); // Kill readonly
        let aMap  = [];

        for (let i in oData) {
            let oItem = oData[i];
            if (oItem.parent_id) {
                let oParent = oData[oItem.parent_id];
                if (!oParent.children) {
                    oParent.children = [];
                }
                oParent.children.push(oItem);
            } else {
                aMap.push(oItem)
            }
        }

        return aMap;
    }

    static setKey(sKey, mValue, fCallback) {
        console.log('Data.setKey', sKey, mValue);
        LocalForage.setItem(sKey, mValue, fCallback);
    }

    static getKey(sKey, fCallback) {
        console.log('Data.getKey', sKey);
        LocalForage.getItem(sKey, fCallback);
    }

    static removeKey(sKey, fCallback) {
        LocalForage.removeItem(sKey, fCallback);
    }

    static SYNC_DATE_KEY = '__SYNC_DATE__';
    static SYNC_KEY      = '__SYNC__';

    static getSyncDate(fCallback) {
        Data.getKey(Data.SYNC_DATE_KEY, fCallback);
    }

    static setSyncDate(sDate, fCallback) {
        Data.setKey(Data.SYNC_DATE_KEY, sDate, fCallback);
    }

    static syncWWW(fCallback) {
        async.auto({
            sync:    Data.getSyncDate,
            read:    fAsyncCallback => {
                Data.getKey(Data.SYNC_KEY, fAsyncCallback);
            },
            update:  ['read', (oResults, fAsyncCallback) => {
                Data.mergeResponse(oResults.read);
                fAsyncCallback();
            }],
            date:    ['sync', (oResults, fAsyncCallback) => {
                let sSync = '';
                if (oResults.sync) {
                    sSync = `?sync=${oResults.sync}`
                }

                fAsyncCallback(null, sSync);
            }],
            query:   ['date', (oResults, fAsyncCallback) => {
                API.query([
                    // Standard Stuff
                    `/place_types${oResults.date}`,

                    // Get Icons - Might as well grab them all now
                    `/icons${oResults.date}`,
                    '/media/{icons.dark_media_id}',
                    '/media/{icons.light_media_id}'
                ], fAsyncCallback);
            }],
            merge: ['query', 'update', (oResults, fAsyncCallback) => {
                Data.mergeResponse(oResults.query[0]);

                fAsyncCallback();
            }],
            syncDate: ['query', (oResults, fAsyncCallback) => {
                Data.setSyncDate(oResults.query[0]._server.date, fAsyncCallback);
            }],
            store: ['merge', (oResults, fAsyncCallback) => {
                let oResponse = oResults.query[0];
                let bMerge  = false;
                let oMerge  = {};
                let aMerges = ['place_types', 'icons', 'media'];

                aMerges.map(sMerge => {
                    if (oResponse[sMerge]) {
                        bMerge = true;
                        oMerge[sMerge] = ['local', sMerge];
                    }
                });

                if (bMerge) {
                    Data.setKey(Data.SYNC_KEY, Data.Base.project(oMerge), fAsyncCallback);
                } else {
                    fAsyncCallback();
                }
            }]
        }, fCallback);
    }
}

export default Data;