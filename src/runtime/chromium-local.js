const path = require("path");
const fs = require("fs");
const { chromium } = require('playwright');

const stateFile = '.state/state.json';

exports.openBrowser = async function() {
	return await chromium.launch();
}

exports.storeState = async function(context) {
	await context.storageState({ path: stateFile });
	console.log(`stored authentication state into ${stateFile}` );
}

exports.restoreState = async function(browser) {
	return await browser.newContext({ storageState: stateFile });
}

exports.hasState = async function() {
	return fs.existsSync(stateFile);
}

exports.snapshot = async function(page, label) {
	const filePath = `.state/snapshot/${label}.png`;
	await page.screenshot({path: filePath});
	console.log(`stored snapshot file at ${filePath}`);
}

