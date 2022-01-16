const { openBrowser, storeState, restoreState, hasState, snapshot } = require('../runtime/chromium.js');

const { PIXIV_LOGIN_ID, PIXIV_PASSWORD, PIXIV_USER_ID } = process.env;

exports.BookmarkPage = class {
	#browser;
	#context;
	#page;

	constructor() {
	}

	// ログインした後、CookieやLocalStrageをファイルにダンプ（次回以降のブラウザ起動時に使い回すため）
	async #loginAndStoreAuthenticationState() {
		await this.#page.click('text=ログイン');
		await this.#page.fill('text=ログインパスワードがわからない >> [placeholder="メールアドレス / pixiv ID"]', PIXIV_LOGIN_ID);
		await this.#page.fill('text=ログインパスワードがわからない >> [placeholder="パスワード"]', PIXIV_PASSWORD);
		await Promise.all([
			this.#page.waitForNavigation(),
			this.#page.click('#LoginComponent >> text=ログイン')
		]);
		await storeState(this.#context);
	}

	async openBookmarkPage() {
		const hasAuthenticationState = await hasState();

		this.#browser = await openBrowser();
		this.#context = hasAuthenticationState ? await restoreState(this.#browser) : await this.#browser.newContext();
		this.#page = await this.#context.newPage();

		const navigationPromise = this.#page.waitForNavigation();
		await this.#page.goto(`https://www.pixiv.net/users/${PIXIV_USER_ID}/bookmarks/artworks`);
		await this.#page.setViewportSize({ width: 1280, height: 696 });
		await navigationPromise;

		if(!hasAuthenticationState) {
			console.log('authentication state file not found. trying relogin.');
			await this.#loginAndStoreAuthenticationState(this.#page);
		}

		await this.#page.waitForSelector('text=ブックマーク管理');
	}

	async hasNsfwArtworks() {
		const nsfwArtworks = await this.#page.$$('text=R-18');
		return nsfwArtworks.length > 0;
	}

	async clickBookmarkManagmentButton() {
		await this.#page.waitForSelector('text=ブックマーク管理');
		await this.#page.click('text=ブックマーク管理');
	}

	async clickNsfwPics() {
		await this.#page.$$eval('text=R-18', elements => elements.forEach(e => e.click()));
	}

	async clickHideBookmarkButton() {
		await this.#page.waitForSelector('div[role="button"]:has-text("非公開にする")');
		await this.#page.click('div[role="button"]:has-text("非公開にする")');
		await this.#page.waitForSelector('text=ブックマーク管理');
	}

	async close() {
		await this.#browser.close();
	}

	async snapshot(label) {
		await snapshot(this.#page, label);
	}
};

