"use strict";

import 'whatwg-fetch';
import HttpError from './HttpError';

export default class API {
    static _token = null;
    static _base_url = API_BASE_URL;

    static setToken(sToken) {
        this._token = sToken;
    }

    static hasToken() {
        return this._token !== null;
    }

    static setBaseUrl(sUrl) {
        this._base_url = sUrl;
    }

    static _getUrl(sEndpoint) {
        if (!this._base_url) {
            throw new Error('API_BASE_URL has not been defined');
        }

        if (!sEndpoint) {
            sEndpoint = '';
        } else if (sEndpoint.charAt(0) == '/') {
            sEndpoint = sEndpoint.substr(1); // strip leading slash
        }

        return this._base_url + sEndpoint;
    }

    static _getHeaders (oHeaders = {}) {
        if (this._token) {
            oHeaders['Authorization'] = 'Bearer: ' + this._token;
        }

        return oHeaders;
    }

    static get (sEndpoint, fCallback) {
        fetch(this._getUrl(sEndpoint), {
            method: 'GET',
            mode: 'cors',
            headers: this._getHeaders({
                'Accept':       'application/json'
            })
        })
            .then(oResponse => { this._respond(oResponse, fCallback); })
            .catch(fCallback);
    }

    static put (sEndpoint, oData, fCallback) {
        fetch(this._getUrl(sEndpoint), {
            method: 'PUT',
            mode: 'cors',
            headers: this._getHeaders({
                'Accept':       'application/json',
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(oData)
        })
            .then(oResponse => { this._respond(oResponse, fCallback); })
            .catch(fCallback);
    }

    static del (sEndpoint, fCallback) {
        fetch(this._getUrl(sEndpoint), {
            method: 'DELETE',
            mode: 'cors',
            headers: this._getHeaders({
                'Accept':       'application/json'
            }),
        })
            .then(oResponse => { this._respond(oResponse, fCallback); })
            .catch(fCallback);
    }

    static post (sEndpoint, oData, fCallback) {
        fetch(this._getUrl(sEndpoint), {
            method: 'POST',
            mode: 'cors',
            headers: this._getHeaders({
                'Accept':       'application/json',
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(oData)
        })
            .then(oResponse => { this._respond(oResponse, fCallback); })
            .catch(fCallback);
    }

    static upload (sEndpoint, oData, aFiles, fCallback) {
        let bAlright = aFiles.every(oFile => oFile.field !== undefined);

        if (!bAlright) {
            return fCallback(new Error('field property must be specified for uploaded files'));
        }

        let oFormData = new FormData;

        Object.keys(oData).map( sKey  => oFormData.append(sKey,        oData[sKey]            ));
        aFiles.map(             oFile => oFormData.append(oFile.field, oFile,      oFile.name ));

        fetch(this._getUrl(sEndpoint), {
            method:  'POST',
            mode: 'cors',
            headers: this._getHeaders(),
            body:    oFormData
        })
            .then(oResponse => { this._respond(oResponse, fCallback); })
            .catch(fCallback);
    }

    static query (endpoints, fCallback) {
        API.post('/', { __query: endpoints }, fCallback);
    }

    static log(sMessage, oContext) {
        let sContext = oContext !== undefined ? JSON.stringify(oContext) : null;
        let oData    = {
            message: sMessage,
            context: sContext
        };

        API.post('/log', oData, oError => {
            if (oError) {
                console.error('log sent with error', sMessage, sContext, oError);
            } else {
                console.log('log sent', sMessage, sContext);
            }
        });
    }

    /**
     *
     * @param {Response} oResponse
     * @param {function} fCallback
     * @private
     */
    static _respond(oResponse, fCallback) {
        if (oResponse.ok) {
            if (oResponse.status == 204) {
                fCallback();
            } else {
                oResponse.json().then(oData => fCallback(null, oData));
            }
        } else {
            fCallback(new HttpError(oResponse.statusText, oResponse.status), oResponse);
        }
    }
}