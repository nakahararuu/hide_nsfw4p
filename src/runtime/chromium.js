const { RUN_LOCALLY } = process.env;
const isLocal = (RUN_LOCALLY == 'true');

const functions = require(isLocal ? "./chromium-local.js" : "./chromium-lambda.js");
Object.assign(exports, functions);
