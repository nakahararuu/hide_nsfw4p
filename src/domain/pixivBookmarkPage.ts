import { openBrowser, storeState, restoreState, hasState, snapshot } from '../runtime/chromium.js';

const { PIXIV_LOGIN_ID, PIXIV_PASSWORD, PIXIV_USER_ID } = process.env;

export class BookmarkPage {
	private static URL = `https://www.pixiv.net/users/${PIXIV_USER_ID}/bookmarks/artworks`;

	private browser: any;
	private context: any;
	private page: any;

	private async initBrowser(): Promise<void> {
		await this.close();

		const hasAuthenticationState = await hasState();
		if (hasAuthenticationState) {
			console.log('authentication state file found. trying to restore it.');
		}

		this.browser = await openBrowser();
		this.context = hasAuthenticationState ? await restoreState(this.browser) : await this.browser.newContext();
		this.page = await this.context.newPage();
	}

	private async login(): Promise<void> {
		await this.page.getByRole('link', { name: 'ログイン' }).click();
		await this.page.fill('input[placeholder="メールアドレスまたはpixiv ID"]', PIXIV_LOGIN_ID);
		await this.page.fill('input[placeholder="パスワード"]', PIXIV_PASSWORD);
		await this.page.getByRole('button', { name: 'ログイン', exact: true }).click();
		await this.page.waitForNavigation();
	}

	public async openBookmarkPage(): Promise<void> {
		await this.initBrowser();

		const navigationPromise = this.page.waitForNavigation();
		await this.page.goto(BookmarkPage.URL);
		await this.page.setViewportSize({ width: 1280, height: 696 });
		await navigationPromise;

		if (this.page.url() !== BookmarkPage.URL) {
			console.log('valid authentication state (cookie, localstorage) not found. trying login.');
			await this.login();
		}

		await this.page.waitForSelector('text=ブックマーク管理');
	}

	public async hasNsfwArtworks(): Promise<boolean> {
		const nsfwArtworks = await this.page.$$('text=R-18');
		return nsfwArtworks.length > 0;
	}

	public async clickBookmarkManagementButton(): Promise<void> {
		await this.page.waitForSelector('text=ブックマーク管理');
		await this.page.click('text=ブックマーク管理');
	}

	public async clickNsfwPics(): Promise<void> {
		await this.page.$$eval('text=R-18', (elements: any) => elements.forEach((e: any) => e.click()));
	}

	public async clickHideBookmarkButton(): Promise<void> {
		await this.page.waitForSelector('div[role="button"]:has-text("非公開にする")');
		await this.page.click('div[role="button"]:has-text("非公開にする")');
		await this.page.waitForSelector('text=ブックマーク管理');
	}

	public async close(): Promise<void> {
		await this.page?.close();
		this.page = null;

		if (this.context) {
			await storeState(this.context);
			await this.context.close();
			this.context = null;
		}

		await this.browser?.close();
		this.browser = null;
	}

	public async snapshot(label: string): Promise<void> {
		await snapshot(this.page, label);
	}
}