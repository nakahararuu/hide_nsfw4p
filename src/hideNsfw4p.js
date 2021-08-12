const { BookmarkPage } = require('./pixivBookmarkPage.js');

module.exports = async function() {
	const pageObject = new BookmarkPage();
	await pageObject.openBookmarkPage();

	if(!await pageObject.hasNsfwArtworks()) {
		await pageObject.close();
		console.log('There is no NSFW pic.');
		return;
	}

	console.log('Start bookmark updating.');
	await pageObject.clickBookmarkManagmentButton();
	await pageObject.clickNsfwPics();
	await pageObject.clickHideBookmarkButton();

	await pageObject.close();
};
