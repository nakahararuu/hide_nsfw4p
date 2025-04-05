import * as fs from 'fs';
import { chromium } from 'playwright';
import { ChromiumFunctions } from "./chromium-functions.js";

const stateFile = '.state/state.json';

export const openBrowser: ChromiumFunctions['openBrowser'] = async () => {
	return await chromium.launch();
}

export const storeState: ChromiumFunctions['storeState'] = async (context) => {
	await context.storageState({ path: stateFile });
	console.log(`stored authentication state into ${stateFile}` );
}

export const restoreState: ChromiumFunctions['restoreState'] = async (browser) => {
	console.log('authentication state file found. trying to restore it.')
	return await browser.newContext({ storageState: stateFile });
}

export const hasState: ChromiumFunctions['hasState'] = async () => {
	return fs.existsSync(stateFile);
}

export const snapshot: ChromiumFunctions['snapshot'] = async (page, label) => {
	const filePath = `.state/snapshot/${label}.png`;
	await page.screenshot({ path: filePath });
	console.log(`stored snapshot file at ${filePath}`);
}

