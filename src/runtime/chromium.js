const isLocal = (process.env.RUN_LOCALLY == 'true');
const chromiumFunctions = await import(isLocal ? './chromium-local.js' : './chromium-lambda.js');
export const { openBrowser, storeState, restoreState, hasState, snapshot } = chromiumFunctions;

