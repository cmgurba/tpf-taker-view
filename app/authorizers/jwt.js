import Base from 'ember-simple-auth/authorizers/base';
import config from '../config/environment';
// copy pasta from tpf-fund-manager for now..
export default Base.extend({
    tokenRefreshEndpoint: `${config.APP.tpfApi}/admin-user-auth/`,

    // This puts the Authorization header on every request
    // that is sent out by the application.
    authorize: function(data, block) {
        const accessToken = data.token;

        if (accessToken) {
            block('Authorization', `Bearer ${accessToken}`);
        }
    }
});
