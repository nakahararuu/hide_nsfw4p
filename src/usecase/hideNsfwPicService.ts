import { BookmarkPage } from '../domain/pixivBookmarkPage.js';

export class HideNsfwPicService {
	private bookmarkPageObject: BookmarkPage;

    constructor() {
		console.log('starting browser setup.');
        this.bookmarkPageObject = new BookmarkPage();
    }

	async execute(): Promise<void> {
		try {
			await this.hideNsfwPics();
		} catch (error) {
			try {
				await this.snapshot();
			} catch (snapshotError) {
				console.error('failed to take snapshot', snapshotError);
			} finally {
				await this.bookmarkPageObject.close();
				throw error;
			}
		}
	};

	private async hideNsfwPics(): Promise<void> {
		console.log('navigating to bookmark page.');
		await this.bookmarkPageObject.openBookmarkPage();

		if(!await this.bookmarkPageObject.hasNsfwArtworks()) {
			await this.bookmarkPageObject.close();
			console.log('There is no NSFW pic.');
			return;
		}

		console.log('NSFW pic found. updating bookmark setting.');
		await this.bookmarkPageObject.clickBookmarkManagementButton();
		await this.bookmarkPageObject.clickNsfwPics();
		await this.bookmarkPageObject.clickHideBookmarkButton();

		await this.bookmarkPageObject.close();
	};

	private async snapshot(): Promise<void> {
		console.warn('trying to take snapshot of the error');
		const label = `error-${Date.now()}`;
		await this.bookmarkPageObject.snapshot(label);
		console.warn(`uploaded snapshot file as ${label}.png`);
	};
};

