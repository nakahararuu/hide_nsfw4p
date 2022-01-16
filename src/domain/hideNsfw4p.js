const { BookmarkPage } = require('./pixivBookmarkPage.js');

exports.hideNsfw4pService = class {
	#bookmarkPageObject;

	async execute() {
		try {
			await this.#runScript();
		} catch (error) {
			await this.#bookmarkPageObject.snapshot(`error-${Date.now()}`);
			await this.#bookmarkPageObject.close();
			throw error;
		}
	};

	async #runScript() {
		this.#bookmarkPageObject = new BookmarkPage();
		await this.#bookmarkPageObject.openBookmarkPage();

		if(!await this.#bookmarkPageObject.hasNsfwArtworks()) {
			await this.#bookmarkPageObject.close();
			console.log('There is no NSFW pic.');
			return;
		}

		console.log('Start bookmark updating.');
		await this.#bookmarkPageObject.clickBookmarkManagmentButton();
		await this.#bookmarkPageObject.clickNsfwPics();
		await this.#bookmarkPageObject.clickHideBookmarkButton();

		await this.#bookmarkPageObject.close();
	};
};
