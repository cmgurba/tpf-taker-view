/* eslint-env node */
'use strict';

const fs = require('fs');
const defaultModuleConfigurationPath = __dirname + '/../node_modules/@glimmer/application-pipeline/lib/broccoli/default-module-configuration.ts';
const defaultModuleConfigurationString = fs.readFileSync(defaultModuleConfigurationPath, 'utf-8');

const moduleConfiguration = eval('(' + defaultModuleConfigurationString.replace('export default', '').replace(';', '') + ')');

moduleConfiguration['types']['data'] = {
  definitiveCollection: 'data-service'
};
moduleConfiguration['collections']['data'] = {
  types: ['data/index'],
  defaultType: 'data'
};

module.exports = function(environment) {
  var ENV = {
      modulePrefix: 'tpf-taker-view',
      environment: environment,
      APP: {
          // Here you can pass flags/options to your application instance
          // when it is created
          tpfApi: 'http://localhost:4141' // flex based off env.
      },
      moduleConfiguration
  };

  return ENV;
};
