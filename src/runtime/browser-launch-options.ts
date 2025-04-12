import { LaunchOptions } from "playwright-core";

const isLocal = (process.env.RUN_LOCALLY === 'true');
export const { launchOptions } = await import(isLocal ? './browser-launch-options-local.js' : './browser-launch-options-lambda.js') as {launchOptions: LaunchOptions};
