const { storeState, restoreState, hasState } = require('./browserStateStrage.js');
const chromium = require('chrome-aws-lambda');
const playwright = require('playwright-core');
const { PIXIV_LOGIN_ID, PIXIV_PASSWORD, PIXIV_USER_ID } = process.env;

// ログインした後、CookieやLocalStrageをファイルにダンプ（次回以降のブラウザ起動時に使い回すため）
async function loginAndStoreAuthenticationState(page) {
	await page.click('text=ログイン');
	await page.fill('text=ログインパスワードがわからない >> [placeholder="メールアドレス / pixiv ID"]', PIXIV_LOGIN_ID);
	await page.fill('text=ログインパスワードがわからない >> [placeholder="パスワード"]', PIXIV_PASSWORD);
	await Promise.all([
		page.waitForNavigation(),
		page.click('#LoginComponent >> text=ログイン')
	]);
	await storeState(page.context());
}

async function openBookmarkPage(browser) {
	const hasAuthenticationState = await hasState();

	const context = hasAuthenticationState ? await restoreState(browser) : await browser.newContext();
	const page = await context.newPage();
	const navigationPromise = page.waitForNavigation();
	
	await page.goto(`https://www.pixiv.net/users/${PIXIV_USER_ID}/bookmarks/artworks`);
	await page.setViewportSize({ width: 1280, height: 696 });
	await navigationPromise;

	if(!hasAuthenticationState) {
		await loginAndStoreAuthenticationState(page);
	}

	return page;
}

async function hasNsfwArtworks(page) {
	const nsfwArtworks= await page.$$('text=R-18');
	return nsfwArtworks.length > 0;
}

exports.main = async function() {
	const browser = await playwright.chromium.launch({
		args: chromium.args,
		executablePath: await chromium.executablePath,
		headless: chromium.headless,
	});
	const page = await openBookmarkPage(browser);

	if(!await hasNsfwArtworks(page)){
		await browser.close();
		console.log('There is no NSFW pic.');
		return;
	}

	// ブックマークの編集を開始
	console.log('Start bookmark updating.');
	await page.waitForSelector('text=ブックマーク管理');
	await page.click('text=ブックマーク管理');
	
	// R-18のものをすべてクリック
	await page.$$eval('text=R-18', elements => elements.forEach(e => e.click()));
	
	// 非公開に設定
	await page.waitForSelector('div[role="button"]:has-text("非公開にする")');
	await page.click('div[role="button"]:has-text("非公開にする")');
	await page.waitForSelector('text=ブックマーク管理');

	await browser.close();
};
