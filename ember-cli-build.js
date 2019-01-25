'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    fingerprint: {
      prepend: 'https://ticketsolve-app.s3-eu-central-1.amazonaws.com/'
    }
  });

  return app.toTree();
};
