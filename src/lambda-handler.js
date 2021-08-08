const chromium = require('chrome-aws-lambda');
const playwright = require('playwright-core');

exports.handler = async function(event, lambdaContext) {
	console.log('Start');

	const browser = await playwright.chromium.launch({
		args: chromium.args,
		executablePath: await chromium.executablePath,
		headless: chromium.headless,
	});

	const context = await browser.newContext();
	const page = await context.newPage();
	const navigationPromise = page.waitForNavigation();

	await page.goto('https://github.com/nakahararuu/hide_nsfw4p');
	await page.setViewportSize({ width: 1280, height: 696 });
	await navigationPromise;

	const text = await page.$eval('text=nakahararuu / hide_nsfw4p', el => el.innerText);
	console.log(`repository name is ${text}`);

	await browser.close();

	console.log('End');
};

