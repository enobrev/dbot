"use strict";

import UUID from '../js/UUID';

// Stupid name.  Ideally this will be an extension of Data.js and then just adds functionality
export default class LocalData {
    constructor() {
    }

    static newProject() {
        return {
            id:         UUID(),
            name:       ''
        };
    }

    static newTable(iProjectId) {
        return {
            id:         UUID(),
            project_id: iProjectId,
            name:       ''
        };
    }

    static newColumn(iTableId) {
        return {
            id:         UUID(),
            table_id:   iTableId,
            name:       ''
        };
    }
}