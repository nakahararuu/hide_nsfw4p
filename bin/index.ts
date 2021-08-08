import * as cdk from '@aws-cdk/core';
import * as stack from '../lib/hideNsfw4pStack';

const app = new cdk.App();
new stack.HideNsfw4pStack(app, 'HideNSFW4p');
app.synth();
