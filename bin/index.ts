import { App } from '@aws-cdk/core';
import { HideNsfw4pStack } from '../lib/hideNsfw4pStack';

const app = new App();
new HideNsfw4pStack(app, 'HideNSFW4p');
app.synth();
