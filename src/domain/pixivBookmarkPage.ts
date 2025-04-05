import { Browser, BrowserContext, Page } from 'playwright-core';
import { openBrowser, storeState, restoreState, hasState, snapshot } from '../runtime/chromium.js';

const { PIXIV_LOGIN_ID, PIXIV_PASSWORD, PIXIV_USER_ID } = process.env;

export class BookmarkPage {
	private static URL = `https://www.pixiv.net/users/${PIXIV_USER_ID}/bookmarks/artworks`;

	private browser?: Browser;
	private context?: BrowserContext;
	private page?: Page;

	private async initBrowser(): Promise<void> {
		await this.close();

		const hasAuthenticationState = await hasState();
		if (hasAuthenticationState) {
			console.log('authentication state file found. trying to restore it.');
		}

		this.browser = await openBrowser();
		this.context = hasAuthenticationState ? await restoreState(this.browser!) : await this.browser!.newContext();
		this.page = await this.context!.newPage();

		await this.page!.setViewportSize({ width: 1280, height: 696 });
	}

	private async login(): Promise<void> {
		await this.page!.getByRole('link', { name: 'ログイン' }).click();
		await this.page!.getByPlaceholder('メールアドレスまたはpixiv ID').fill(PIXIV_LOGIN_ID!);
		await this.page!.getByPlaceholder('パスワード').fill(PIXIV_PASSWORD!);
		await this.page!.getByRole('button', { name: 'ログイン', exact: true }).click();
	}

	public async openBookmarkPage(): Promise<void> {
		await this.initBrowser();

		await this.page!.goto(BookmarkPage.URL);
		if (this.page!.url() !== BookmarkPage.URL) {
			console.log('valid authentication state (cookie, localstorage) not found. trying login.');
			await this.login();
		}

		await this.page!.waitForURL(BookmarkPage.URL);
	}

	public async hasNsfwArtworks(): Promise<boolean> {
        const nsfwArtworksCount = await this.page!.getByText('R-18').count();
		return nsfwArtworksCount > 0;
	}

	public async clickBookmarkManagementButton(): Promise<void> {
		await this.page!.click('text=ブックマーク管理');
	}

	public async clickNsfwPics(): Promise<void> {
		await this.page!.locator('text=R-18').evaluateAll((elements: any) => elements.forEach((e: any) => e.click()));
	}

	public async clickHideBookmarkButton(): Promise<void> {
		await this.page!.getByRole('button').filter({hasText: "非公開にする"}).click();
		await this.page!.getByText('ブックマーク管理').waitFor();
	}

	public async close(): Promise<void> {
		await this.page!.close();
		this.page = void 0;

		if (this.context) {
			await storeState(this.context!);
			await this.context!.close();
			this.context = void 0;
		}

		await this.browser?.close();
		this.browser = void 0;
	}

	public async snapshot(label: string): Promise<void> {
		await snapshot(this.page!, label);
	}
}