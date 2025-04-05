import { Page } from 'playwright-core';

const { PIXIV_LOGIN_ID, PIXIV_PASSWORD } = process.env;

export class PixivLoginPage {
	private static URL = `https://www.pixiv.net`;

	private page: Page;

	private constructor(page: Page) {
		this.page = page;
	}

	public static async open(page: Page): Promise<PixivLoginPage> {
		console.log('navigating to login page.');
		await page.goto(PixivLoginPage.URL);
		return new PixivLoginPage(page);
	}

	public async login(): Promise<void> {
		const loginLinkLocator = this.page.getByRole('link', { name: 'ログイン' });

		if (await loginLinkLocator.count() === 0) {
			console.log('already logged in.');
			return;
		}

		console.log('try logging in to pixiv.');
		await loginLinkLocator.click();

		await this.page.getByPlaceholder('メールアドレスまたはpixiv ID').fill(PIXIV_LOGIN_ID!);
		await this.page.getByPlaceholder('パスワード').fill(PIXIV_PASSWORD!);
		await this.page.getByRole('button', { name: 'ログイン', exact: true }).click();

		await this.page.waitForEvent('load');
		console.log('logged in.');
	}
}
