import cdk = require('@aws-cdk/core');
import stack = require('../lib/hideNsfw4pStack');

const app = new cdk.App();
new stack.HideNsfw4pStack(app, 'HideNSFW4p');
app.synth();
