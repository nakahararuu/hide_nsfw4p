import { BookmarkPage } from './pixivBookmarkPage.js';

export class HideNsfw4pService {
	#bookmarkPageObject;

	async execute() {
		try {
			await this.#runScript();
		} catch (error) {
			try {
				console.warn('trying to take snapshot of the error');
				const label = `error-${Date.now()}`;
				await this.#bookmarkPageObject.snapshot(label);
				console.warn(`uploaded snapshot file as ${label}.png`);
			} catch (snapshotError) {
				console.error('failed to take snapshot', snapshotError);
			} finally {
				await this.#bookmarkPageObject.close();
				throw error;
			}
		}
	};

	async #runScript() {
		console.log('starting browser setup.');
		this.#bookmarkPageObject = new BookmarkPage();

		console.log('navigating to bookmark page.');
		await this.#bookmarkPageObject.openBookmarkPage();

		if(!await this.#bookmarkPageObject.hasNsfwArtworks()) {
			await this.#bookmarkPageObject.close();
			console.log('There is no NSFW pic.');
			return;
		}

		console.log('NSFW pic found. updating bookmark setting.');
		await this.#bookmarkPageObject.clickBookmarkManagmentButton();
		await this.#bookmarkPageObject.clickNsfwPics();
		await this.#bookmarkPageObject.clickHideBookmarkButton();

		await this.#bookmarkPageObject.close();
	};
};

