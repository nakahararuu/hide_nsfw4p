import { openBrowser, restoreState, hasState, storeState, snapshot } from '../runtime/chromium.js';
import { PixivLoginPage } from '../domain/pixivLoginPage.js';
import { BookmarkPage } from '../domain/pixivBookmarkPage.js';
import { Browser, BrowserContext, Page } from 'playwright';

export class HideNsfwPicService {
	private page: Page;
	private browser: Browser;
	private context: BrowserContext;

	private constructor(page: Page, browser: Browser, context: BrowserContext) {
		this.page = page;
		this.browser = browser;
		this.context = context;
	}

	/**
	 * Initializes the HideNsfwPicService with a new browser context.
	 * If a previous state exists, it restores the state instead of creating a new one.
	 */
	public static async initContext(): Promise<HideNsfwPicService> {
		console.log('starting browser setup.');

		const browser = await openBrowser();
		const context = await hasState() ? await restoreState(browser) : await browser.newContext();
		const page = await context.newPage();

		return new HideNsfwPicService(page, browser, context);
	}

	/**
	 * Accesses the Pixiv bookmark page and hides NSFW images.
	 */
	public async execute(): Promise<void> {
		try {
			await this.hideNsfwPics();
			await storeState(this.context);
		} catch (error) {
			await this.snapshot();
			throw error;
		}
	}

	private async hideNsfwPics(): Promise<void> {
		// perform login
		const loginPage = await PixivLoginPage.open(this.page);
		await loginPage.login();

		// navigate to bookmark page
		const bookmarkPageObject = await BookmarkPage.open(this.page);

		if (!await bookmarkPageObject.hasNsfwArtworks()) {
			console.log('There is no NSFW pic.');
			return;
		}

		console.log('NSFW pic found. updating bookmark setting.');
		await bookmarkPageObject.clickBookmarkManagementButton();
		await bookmarkPageObject.clickNsfwPics();
		await bookmarkPageObject.clickHideBookmarkButton();
	}

	private async snapshot(): Promise<void> {
		const label = `snapshot_${Date.now()}.png`;
		await snapshot(this.page, label);
		console.warn(`uploaded snapshot file as ${label}.png`);
	}
	
	/**
	 * Closes the browser context and the browser.
	 */
	public async close(): Promise<void> {
		await this.context.close();
		await this.browser.close();
	}
}

