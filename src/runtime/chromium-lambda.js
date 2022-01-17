const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const chromium = require('chrome-aws-lambda');
const playwright = require('playwright-core');
const path = require("path");
const fs = require("fs");

// TODO 環境変数から取得
const s3 = new S3Client({ region: "ap-northeast-1" });

const { BUCKET_NAME } = process.env;
const tmpStateFile = '/tmp/state.json';

exports.openBrowser = async function() {
	await chromium.font('https://fonts.gstatic.com/ea/notosansjapanese/v6/NotoSansJP-Regular.woff2');

	return await playwright.chromium.launch({
		args: chromium.args,
		executablePath: await chromium.executablePath,
		headless: chromium.headless,
	});
}

exports.storeState = async function(context) {
	await context.storageState({ path: tmpStateFile });

	const uploadParams = {
		Bucket: BUCKET_NAME,
		Key: path.basename(tmpStateFile),
		Body: fs.createReadStream(tmpStateFile)
	};

	try {
		await s3.send(new PutObjectCommand(uploadParams));
		console.log("uploaded authentication state file");
	} catch (err) {
		console.error("authentication state file uploading failed", err);
	}
}

exports.restoreState = async function(browser) {
	const getParams = {
		Bucket: BUCKET_NAME,
		Key: path.basename(tmpStateFile)
	};

	try {
		const data = await s3.send(new GetObjectCommand(getParams));
		const ws = fs.createWriteStream(tmpStateFile);
		data.Body.pipe(ws);
		data.Body.on('end',()=>console.log("downloaded authentication state file"));

		return await browser.newContext({ storageState: tmpStateFile });
	} catch (err) {
		console.log("authentication state file downloading faild", err);
		return await browser.newContext();
	}
}

exports.hasState = async function() {
	const headParams = {
		Bucket: BUCKET_NAME,
		Key: path.basename(tmpStateFile)
	};

	try {
		await s3.send(new HeadObjectCommand(headParams));
		return true;
	} catch (err) {
		console.warn("authentication state metadata fetch Error", err);
		return false;
	}
}

exports.snapshot = async function(page, label) {
	const fileName = `${label}.png`;
	const tmpFilePath = `/tmp/${fileName}`;
	await page.screenshot({path: tmpFilePath});

	const uploadParams = {
		Bucket: BUCKET_NAME,
		Key: fileName,
		Body: fs.createReadStream(tmpFilePath)
	};
	try {
		await s3.send(new PutObjectCommand(uploadParams));
		console.log(`uploaded snapshot file at ${BUCKET_NAME}/${fileName}`);
	} catch (err) {
		console.log("snapshot file uploading failed", err);
	}
}

