const { chromium } = require('playwright');

(async () => {
	const browser = await chromium.launch()
	const page = await browser.newPage()
	const navigationPromise = page.waitForNavigation()
	
  	await page.goto(`https://www.pixiv.net/?return_to=%2Fusers%2F${process.env.PIXIV_USER_ID}%2Fbookmarks%2Fartworks`);
	await page.setViewportSize({ width: 1280, height: 696 })
	await navigationPromise

	// ログイン
	await page.click('text=ログイン')
	await page.fill('text=ログインパスワードがわからない >> [placeholder="メールアドレス / pixiv ID"]', process.env.PIXIV_LOGIN_ID);
	await page.fill('text=ログインパスワードがわからない >> [placeholder="パスワード"]', process.env.PIXIV_PASSWORD);
	await Promise.all([
		page.waitForNavigation(/*{ url: 'https://www.pixiv.net/users/192633/bookmarks/artworks' }*/),
		page.click('#LoginComponent >> text=ログイン')
	]);
	
	// ブックマークの編集を開始
	await page.waitForSelector('text=ブックマーク管理')
	await page.click('text=ブックマーク管理')
	
	// R-18のものをすべてクリック
	await page.waitForSelector('text=R-18')
	await page.$$eval('text=R-18', elements => elements.forEach(e => e.click()))
	
	// 非公開に設定
	await page.waitForSelector('div[role="button"]:has-text("非公開にする")')
	await page.click('div[role="button"]:has-text("非公開にする")');

	await browser.close()
})();

