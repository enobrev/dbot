"use strict";

import moment from 'moment';
import UUID from '../js/UUID';

// Stupid name.  Ideally this will be an extension of Data.js and then just adds functionality
export default class LocalData {
    constructor() {
    }

    static newProject() {
        return {
            id:         UUID(),
            name:       '',
            date_added: moment().format('YYYY-MM-DD HH:mm:ss')
        };
    }

    static newTable(iProjectId) {
        return {
            id:         UUID(),
            project_id: iProjectId,
            name:       '',
            date_added: moment().format('YYYY-MM-DD HH:mm:ss')
        };
    }

    static newColumn(iTableId) {
        return {
            id:         UUID(),
            table_id:   iTableId,
            name:       '',
            date_added: moment().format('YYYY-MM-DD HH:mm:ss')
        };
    }

    static newColumnType() {
        return {
            id:         UUID(),
            name:       '',
            date_added: moment().format('YYYY-MM-DD HH:mm:ss')
        };
    }
}