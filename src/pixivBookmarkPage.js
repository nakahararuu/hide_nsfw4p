const { storeState, restoreState, hasState } = require('./browserStateStrage.js');

const chromium = require('chrome-aws-lambda');
const playwright = require('playwright-core');

const { PIXIV_LOGIN_ID, PIXIV_PASSWORD, PIXIV_USER_ID } = process.env;

exports.BookmarkPage = class {
	constructor() {
	}

	// ログインした後、CookieやLocalStrageをファイルにダンプ（次回以降のブラウザ起動時に使い回すため）
	async _loginAndStoreAuthenticationState(page) {
		await page.click('text=ログイン');
		await page.fill('text=ログインパスワードがわからない >> [placeholder="メールアドレス / pixiv ID"]', PIXIV_LOGIN_ID);
		await page.fill('text=ログインパスワードがわからない >> [placeholder="パスワード"]', PIXIV_PASSWORD);
		await Promise.all([
			page.waitForNavigation(),
			page.click('#LoginComponent >> text=ログイン')
		]);
		await storeState(page.context());
	}

	async _openBrowser() {
		this.browser = await playwright.chromium.launch({
			args: chromium.args,
			executablePath: await chromium.executablePath,
			headless: chromium.headless,
		});
	}

	async openBookmarkPage() {
		await this._openBrowser();

		const hasAuthenticationState = await hasState();

		const context = hasAuthenticationState ? await restoreState(this.browser) : await this.browser.newContext();
		const page = await context.newPage();
		const navigationPromise = page.waitForNavigation();

		await page.goto(`https://www.pixiv.net/users/${PIXIV_USER_ID}/bookmarks/artworks`);
		await page.setViewportSize({ width: 1280, height: 696 });
		await navigationPromise;

		if(!hasAuthenticationState) {
			await this._loginAndStoreAuthenticationState(page);
		}

		this.page = page;
	}

	async hasNsfwArtworks() {
		const nsfwArtworks = await this.page.$$('text=R-18');
		return nsfwArtworks.length > 0;
	}

	async clickBookmarkManagmentButton() {
		await this.page.waitForSelector('text=ブックマーク管理');
		await this.page.click('text=ブックマーク管理');
	}

	async clickNsfwPics() {
		await this.page.$$eval('text=R-18', elements => elements.forEach(e => e.click()));
	}

	async clickHideBookmarkButton() {
		await this.page.waitForSelector('div[role="button"]:has-text("非公開にする")');
		await this.page.click('div[role="button"]:has-text("非公開にする")');
		await this.page.waitForSelector('text=ブックマーク管理');
	}

	async close() {
		await this.browser.close();
	}
};

