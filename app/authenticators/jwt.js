import Ember from 'ember';
import Base from 'ember-simple-auth/authenticators/base';
import config from '../config/environment';
// copy pasta right now from tpf-fund-manager
export default Base.extend({
    tokenEndpoint: `${config.APP.tpfApi}/login`,

    restore: function(data) {
        return new Ember.RSVP.Promise(function(resolve, reject) {
            if (!Ember.isEmpty(data.token)) {
                resolve(data);
            } else {
                reject();
            }
        });
    },

    authenticate: function(username, password) {
        // absence of password will assume authentication with username = token
        // otherwise a traditional auth is used (username/password).
        return new Ember.RSVP.Promise((resolve, reject) => {
            if (password === null) {
                let token = username;
                Ember.$.post({
                    url: this.get('tokenEndpoint'),
                    data: JSON.stringify({ token }),
                    contentType: 'application/json;charset=utf-8',
                    dataType: 'json'
                }).done((response={}) => {
                    Ember.run(() => {
                        resolve({
                            token,
                            data: Ember.get(response , 'payload.user') || {
                                emailAddress: `${token.substr(0,10)}...`,
                                fullName: `${token.substr(0,10)}...`,
                            }
                        });
                    });
                }).fail(xhr => Ember.run(() => reject(xhr.responseText)));
            } else {
                Ember.$.post({
                    url: this.get('tokenEndpoint'),
                    data: JSON.stringify({ username, password }),
                    contentType: 'application/json;charset=utf-8',
                    dataType: 'json'
                }).done((response={}) => {
                    Ember.run(() => {
                        resolve({
                            token: response.jwt,
                            data: Ember.get(response , 'payload.user') || {
                                emailAddress: `${username}@c2fo.com`,
                                fullName: username,
                            }
                        });
                    });
                }).fail(xhr => Ember.run(() => reject(xhr.responseText)));
            }
        });
    },

    invalidate: function(data) {
        if (data.token) {
            delete data.token;
        }
        return Ember.RSVP.resolve();
    }
});
