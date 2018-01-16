import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import Ember from 'ember';
import config from '../config/environment';
// copy pasta right now from tpf-fund-manager


// This will be the Feathersjs adapter for ember-data once it's done
// Nothing has been tested other than GET of data. POST, PATCH, DELETE
// will all need to be tested and added.
export default DS.RESTAdapter.extend(DataAdapterMixin, {
    toast: Ember.inject.service(),

    defaultSerializer: 'serializer:application',
    authorizer: 'authorizer:jwt',
    host: config.APP.tpfApi,

    /**
     * Overridden to support feathersjs style end points which are always
     * hyphenated and use plurals.
     */
    pathForType: function (type) {
        const dasherized = Ember.String.dasherize(type);
        return Ember.String.pluralize(dasherized);
    },

    handleResponse: function (status, headers, payload) {
        const session = this.get('session');

        // Update the JWT on each response from the server.
        // This keeps the session alive over time as long
        // as the user is doing something with data inside
        // the application.
        if (payload && payload.jwt) {
            const authData = session.get('data');

            if (authData.authenticated) {
                // Use set so the token is actually updated.
                session.set('data.authenticated.token', payload.jwt);
            }
        }

        switch (session && status) {
        case 401:
            return session.invalidate();
        case 403:
            return session.invalidate();
        default:
            if (session && status >= 400) {
                const err = feathersErrorResponse.call(this, status, headers, payload, session);
                const errorMessages = err.errors.map(err => err.detail).join('<br/>');
                this.get('toast').error(errorMessages, err.name);
                return err;
            }
            return this._super.apply(this, arguments);
        }
    },

    // Sanitize/convert unsupported params to supported query actions.
    query(store, type, query) {
        let newQuery = Ember.copy(query, true);

        // set the query.$limit
        if (!Ember.isEmpty(query.pageSize)) {
            newQuery.$limit = query.pageSize;
            delete newQuery.pageSize;
        }

        // set the query.$skip
        if (!Ember.isEmpty(query.page)) {
            newQuery.$skip = (newQuery.page - 1) * newQuery.$limit;
            delete newQuery.page;
        }

        // Set the query.$sort.
        // The 'sort' property overrides the supported($sort).
        const sortDirectionMap = {
            'ASC': 1,
            'DESC': -1,
            'NONE': null,
        };
        if (!Ember.isEmpty(query.sort)) {
            newQuery.$sort = newQuery.sort;
            delete newQuery.sort;
        }

        // convert non-numerical sort directions to values.
        if (Ember.typeOf(newQuery.$sort) === 'object') {
            Object.keys(newQuery.$sort).forEach(key => {
                let val = newQuery.$sort[key];
                if (['ASC', 'DESC', 'asc', 'desc'].indexOf(val) !== -1) {
                    newQuery.$sort[key] = sortDirectionMap[val.toUpperCase()]
                } else if (isNaN(val)) {
                    delete newQuery.$sort[key];
                }
            });
        }

        // Check all known unsupported query properties even if they've been handled above.
        const unsupported = [
            'page',
            'pageSize',
            'sort',
        ];
        unsupported.forEach((unsupportedQuery) => {
            if (Ember.isNone(newQuery[unsupportedQuery]) || Ember.isEmpty(newQuery[unsupportedQuery])) {
                return;
            }
            Ember.warn(`An unknown service query parameter has not been sanitized and may cause errors: "${unsupportedQuery}"`);
        });

        // Check for existence of include, change to $populate
        if (!Ember.isEmpty(newQuery.include)) {
            newQuery.$populate = newQuery.include;
            delete newQuery.include;
        }

        return this._super(store, type, newQuery);
    },

    /**
     Called by the store when an existing record is saved
     via the `save` method on a model record instance.
     The `updateRecord` method serializes the record and makes an Ajax (HTTP PUT) request
     to a URL computed by `buildURL`.
     See `serialize` for information on how to customize the serialized form
     of a record.

     This is a direct copy of the original implementation. The difference here is that
     this is now a PATCH instead of a PUT. Removing the "bonus" work of fancy requests.

     @method updateRecord
     @param {DS.Store} store
     @param {DS.Model} type
     @param {DS.Snapshot} snapshot
     @return {Promise} promise
     */
    updateRecord(store, type, snapshot) {
        const data = {};
        const submittedData = {};
        const modelName = Ember.String.camelize(type.modelName);
        const serializer = store.serializerFor(modelName);

        serializer.serializeIntoHash(data, type, snapshot);

        const id = snapshot.id;
        const url = this.buildURL(modelName, id, snapshot, 'updateRecord');

        // Use data directly because serializeIntoHash gives the object directly differently for feathers.
        const dataKeys = Object.keys(data);

        // Ensure code only sends the data we are actually updating on a record.
        dataKeys.forEach((key) => {
            if (key in snapshot.changedAttributes()) {
                submittedData[key] = data[key];
            }
        });
        return this.ajax(url, "PATCH", { data: submittedData });
    },

    /**
     * Override of buildQuery.  Conform to our current adapter API by passing
     * "include" as "$populate" for joined models.  This method is called by
     * `store.findRecord` and `store.findAll`.
     *
     * https://github.com/emberjs/data/blob/v2.12.0/addon/adapters/rest.js#L1203
     * @param {*} snapshot
     */
    buildQuery(snapshot) {
        const query = this._super(snapshot);
        if (!Ember.isEmpty(query.include)) {
            let newQuery = Object.assign({}, query);
            newQuery.$populate = query.include;
            delete newQuery.include;
            return newQuery;
        }
        return query;
    }
});


/**
 * Adapter methods to deal with errors returned from feathers.js
 * See docs for more info - https://docs.feathersjs.com/middleware/error-handling.html
 *
 * @param status
 * @param headers
 * @param payload - the error payload object from feathers.js
 *        payload.name - The error name (ie. "BadRequest", "ValidationError", etc.)
 *        payload.message - The error message string
 *        payload.code - The HTTP status code
 *        payload.className - A CSS class name that can be handy for styling errors based on the error type. (ie. "bad-request" , etc.)
 *        payload.data - An object containing anything you passed to a Feathers error except for the errors object.
 *        payload.errors - An object containing whatever was passed to a Feathers error inside errors. This is typically validation errors or if you want to group multiple errors together.
 * @returns {DS.ServerError}
 */

function feathersErrorResponse(status, headers, payload) {
    let errors = [{
        detail: payload.message,
        source: { pointer: '/data' }
    }];

    if (payload.errors && payload.errors.length > 0) {
        errors = errors.concat(payload.errors);
    }

    errors.name = payload.name || null;

    //TODO: use DS.InvalidError or DS.ServerError?
    return new DS.InvalidError(errors);
}
