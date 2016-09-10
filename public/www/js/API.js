"use strict";

import {default as request} from 'superagent';

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

    static getUrl(sEndpoint) {
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

    static _getHeaders () {
        let oHeaders = {};
        if (this._token) {
            oHeaders['Authorization'] = 'Bearer: ' + this._token;
        }

        return oHeaders;
    }

    static query (endpoints, fCallback) {
        request
            .post(this.getUrl())
            .type('json')
            .set(this._getHeaders())
            .send(JSON.stringify({
                __query: endpoints
            }))
            .end((oError, oResponse) => this._respond(fCallback, oError, oResponse));
    }

    static get (sEndpoint, fCallback) {
        request
            .get(this.getUrl(sEndpoint))
            .set(this._getHeaders())
            .end((oError, oResponse) => this._respond(fCallback, oError, oResponse));
    }

    static put (sEndpoint, oData, fCallback) {
        request
            .put(this.getUrl(sEndpoint))
            .type('form')
            .set(this._getHeaders())
            .send(oData)
            .end((oError, oResponse) => this._respond(fCallback, oError, oResponse));
    }

    static del (sEndpoint, fCallback) {
        request
            .delete(this.getUrl(sEndpoint))
            .type('form')
            .set(this._getHeaders())
            .end((oError, oResponse) => this._respond(fCallback, oError, oResponse));
    }

    static post (sEndpoint, oData, fCallback) {
        request
            .post(this.getUrl(sEndpoint))
            .type('form')
            .set(this._getHeaders())
            .send(oData)
            .end((oError, oResponse) => this._respond(fCallback, oError, oResponse));
    }

    static log(sMessage, oContext) {
        let sContext = oContext !== undefined ? JSON.stringify(oContext) : null;
        let oData    = {
            message: sMessage,
            context: sContext
        };

        request
            .post(this.getUrl('/log'))
            .type('form')
            .set(this._getHeaders())
            .send(oData)
            .end(oError => {
                if (oError) {
                    console.error('log sent with error', sMessage, sContext, oError);
                } else {
                    console.log('log sent', sMessage, sContext);
                }
            });
    }

    static upload (sEndpoint, oData, aFiles, fCallback) {
        for (let i in aFiles) {
            if (aFiles[i].field === undefined) {
                return fCallback(new Error('field property must be specified for uploaded files'));
            }
        }

        let oRequest = request
            .post(this.getUrl(sEndpoint))
            .set(this._getHeaders());

        Object.keys(oData).forEach(sKey => oRequest.field(sKey, oData[sKey]));

        aFiles.forEach(oFile => oRequest.attach(oFile.field, oFile, oFile.name));

        oRequest.end((oError, oResponse) => this._respond(fCallback, oError, oResponse));
    }

    static _respond(fCallback, oError, oResponse) {
        if (oError) {
            return fCallback(oError);
        }

        fCallback(oError, oResponse.body, oResponse.text)
    }
}