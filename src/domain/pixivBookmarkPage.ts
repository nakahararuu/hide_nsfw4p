import { Page } from 'playwright-core';

export class BookmarkPage {
	private static URL = `https://www.pixiv.net/users/${process.env.PIXIV_USER_ID}/bookmarks/artworks`;

	private page: Page;

	private constructor(page: Page) {
		this.page = page;
	}

	public static async open(page: Page): Promise<BookmarkPage> {
		console.log('navigating to bookmark page.');

		await page.goto(BookmarkPage.URL);
		if (page.url() !== BookmarkPage.URL) {
			throw new Error('Authentication required. Please log in first.');
		}
		
		return new BookmarkPage(page);
	}

	public async hasNsfwArtworks(): Promise<boolean> {
		const nsfwArtworksCount = await this.page.getByText('R-18').count();
		return nsfwArtworksCount > 0;
	}

	public async clickBookmarkManagementButton(): Promise<void> {
		await this.page.click('text=ブックマーク管理');
	}

	public async clickNsfwPics(): Promise<void> {
		await this.page.locator('text=R-18').evaluateAll((elements: any) => elements.forEach((e: any) => e.click()));
	}

	public async clickHideBookmarkButton(): Promise<void> {
		await this.page.getByRole('button').filter({ hasText: '非公開にする' }).click();
		await this.page.getByText('ブックマーク管理').waitFor();
	}
}