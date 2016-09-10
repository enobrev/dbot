"use strict";

import Crossroads from 'crossroads';

/*
    Unfortunately Crossroads does not expose the Route or the Lexer, which is what we really need here.
    The intention of this wrapper is to expose only two methods: setRoutes and parseLocation.

    setRoutes takes a single object which holds named route definitions, the first of which is matched by
    parseLocation, will be returned, in full, with the "state" method run with the resulting parameters from the URL

    The parseLocation method accepts a History.js Location object, and will add the pathname, search, and query to
    the state that is output with the "winning" route definition.

    The entire purpose of this wrapper is to run synchronously and to return a full "state" object that can be passed
    throughout an SPA to defined the UI accordingly.

*/

Crossroads.shouldTypecast = true;
Crossroads.normalizeFn    = Crossroads.NORM_AS_OBJECT;

/**
 * The Routes Object is meant to look something like this:
 *
 * {
 *     routeName: {
 *         match: 'Crossroads Matching String, Regex, etc',
 *         rules: 'Crossroads Matching Rules',
 *         state: Object or Method to run upon the request / params that returns an object.  This object is meant to be
 *                passed around throughout the application to define whatever correlation the location has with the
 *                rest of the application, such as the primary component to show, boolean values for sub-sections, and so on.
 *     },
 *     routeTwo: {
 *         ...
 *     }
 * }
 *
 *
 * @param {Object} routes
 */
Crossroads.__proto__.setRoutes = function(routes) {
    if (this._namedRoutes === undefined) {
        this._namedRoutes = {};
    }

    for (var name in routes) {
        var routeDefinition = routes[name];

        routeDefinition.name  = name;
        routeDefinition.route = this.addRoute(routeDefinition.match, null, null, this);
        if (routeDefinition.rules) {
            routeDefinition.route.rules = routeDefinition.rules;
            delete routeDefinition.rules;
        }

        this._namedRoutes[name] = routeDefinition;
    }
};

/**
 *
 * Checks routes in order from first to last and returns the definition that matches first
 * @param {Object} location - Location Object from History.js
 * @return {null|{Object}}
 */
Crossroads.__proto__.parseLocation = function (location) {
    var request = location.pathname + location.search;
    for (var name in this._namedRoutes) {
        var routeDefinition = Object.assign({}, this._namedRoutes[name]);
        if (routeDefinition.route.match(request)) {

            var params = routeDefinition.route._getParamsArray(request);
            routeDefinition.params = params && params.length > 0 ? params[0] : {};

            if (typeof routeDefinition.state == 'function') {
                routeDefinition.state = routeDefinition.state(request, routeDefinition.params)
            } else {
                routeDefinition.state = Object.assign({}, routeDefinition.state);
            }

            if (!routeDefinition.state) {
                routeDefinition.state = {};
            }

            routeDefinition.state.path   = location.pathname;
            routeDefinition.state.search = location.search;
            routeDefinition.state.query  = location.query;

            return routeDefinition;
        }
    }

    return null;
};

export default Crossroads;