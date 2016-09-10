"use strict";

    import API from './API';


export default class API_Test {

    static get(fCallback) {
        API.get('projects/1', (oError, oResponse) => {
            if (oError) {
                console.error('get', oError, oResponse);
            } else {
                console.info('get', oResponse);
            }
            fCallback();
        });
    }

    static put(fCallback) {
        API.put('projects/1', { id: 1, name: 'test2' }, (oError, oResponse) => {
            if (oError) {
                console.error('put', oError, oResponse);
            } else {
                console.info('put', oResponse);
            }
            fCallback();
        });
    }

    static post(fCallback) {
        API.post('projects/1', { id: 1, name: 'test' }, (oError, oResponse) => {
            if (oError) {
                console.error('post', oError, oResponse);
            } else {
                console.info('post', oResponse);
            }
            fCallback();
        });
    }

    static del(fCallback) {
        API.del('projects/1', (oError, oResponse) => {
            if (oError) {
                console.error('delete', oError, oResponse);
            } else {
                console.info('delete', oResponse);
            }
            fCallback();
        });
    }
}

API_Test.post(() => {
    API_Test.get(() => {
        API_Test.put(() => {
            API_Test.get(() => {
                API_Test.del(() => {
                    console.warn('Done');
                });
            });
        });
    });
});