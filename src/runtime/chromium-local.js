import * as path from 'path';
import * as fs from 'fs';
import { chromium } from 'playwright';

const stateFile = '.state/state.json';

export async function openBrowser() {
	return await chromium.launch();
}

export async function storeState(context) {
	await context.storageState({ path: stateFile });
	console.log(`stored authentication state into ${stateFile}` );
}

export async function restoreState(browser) {
	return await browser.newContext({ storageState: stateFile });
}

export async function hasState() {
	return fs.existsSync(stateFile);
}

export async function snapshot(page, label) {
	const filePath = `.state/snapshot/${label}.png`;
	await page.screenshot({path: filePath});
	console.log(`stored snapshot file at ${filePath}`);
}

