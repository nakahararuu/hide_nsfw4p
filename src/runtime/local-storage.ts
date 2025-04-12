import * as fs from 'fs';
import { BrowserContextStorage } from "./browser-context-storage.d.js";

const stateFile = '.state/state.json';

export const storeState: BrowserContextStorage['storeState'] = async (context) => {
	await context.storageState({ path: stateFile });
	console.log(`stored authentication state into ${stateFile}` );
}

export const restoreState: BrowserContextStorage['restoreState'] = async (browser) => {
	console.log('authentication state file found. trying to restore it.')
	return await browser.newContext({ storageState: stateFile });
}

export const hasState: BrowserContextStorage['hasState'] = async () => {
	return fs.existsSync(stateFile);
}

export const snapshot: BrowserContextStorage['snapshot'] = async (page, label) => {
	const filePath = `.state/snapshot/${label}.png`;
	await page.screenshot({ path: filePath });
	console.log(`stored snapshot file at ${filePath}`);
}