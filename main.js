const { chromium } = require('playwright');
const { existsSync } = require('fs');

async function openBookmarkPage(browser) {
	const authenticationStateFilePath = '.state/state.json';
	const hasAuthenticationState = existsSync(authenticationStateFilePath)

	const context = await browser.newContext(hasAuthenticationState ? { storageState: authenticationStateFilePath } : {});
	const page = await context.newPage();
	const navigationPromise = page.waitForNavigation();
	
	await page.goto(`https://www.pixiv.net/users/${process.env.PIXIV_USER_ID}/bookmarks/artworks`);
	await page.setViewportSize({ width: 1280, height: 696 });
	await navigationPromise;

	// 未ログインであればログイン。その後CookieやLocalStrageをファイルにダンプして次回以降のブラウザ起動時に使い回す。
	if(!hasAuthenticationState) {
		await page.click('text=ログイン');
		await page.fill('text=ログインパスワードがわからない >> [placeholder="メールアドレス / pixiv ID"]', process.env.PIXIV_LOGIN_ID);
		await page.fill('text=ログインパスワードがわからない >> [placeholder="パスワード"]', process.env.PIXIV_PASSWORD);
		await Promise.all([
			page.waitForNavigation(),
			page.click('#LoginComponent >> text=ログイン')
		]);
		await page.context().storageState({ path: authenticationStateFilePath });
	}

	return page;
}

async function hasNsfwArtworks(page) {
	const nsfwArtworks= await page.$$('text=R-18');
	return nsfwArtworks.length > 0;
}

(async () => {
	const browser = await chromium.launch();
	const page = await openBookmarkPage(browser);

	if(!(await hasNsfwArtworks(page))){
		await browser.close();
		return;
	}

	// ブックマークの編集を開始
	await page.waitForSelector('text=ブックマーク管理');
	await page.click('text=ブックマーク管理');
	
	// R-18のものをすべてクリック
	await page.$$eval('text=R-18', elements => elements.forEach(e => e.click()));
	
	// 非公開に設定
	await page.waitForSelector('div[role="button"]:has-text("非公開にする")');
	await page.click('div[role="button"]:has-text("非公開にする")');

	await browser.close();
})();
