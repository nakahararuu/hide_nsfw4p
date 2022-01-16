const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");

const path = require("path");
const fs = require("fs");

// TODO 環境変数から取得
const s3 = new S3Client({ region: "ap-northeast-1" });

const { BUCKET_NAME, RUN_LOCALLY } = process.env;
const isLocal = (RUN_LOCALLY == 'true');
const tmpFile = isLocal ? ".state/state.json" : "/tmp/state.json";

exports.openBrowser = async function() {
	if(isLocal){
		const { chromium } = require('playwright');
		return await chromium.launch();
	} else {
		const chromium = require('chrome-aws-lambda');
		const playwright = require('playwright-core');
		return  await playwright.chromium.launch({
			args: chromium.args,
			executablePath: await chromium.executablePath,
			headless: chromium.headless,
		});
	}
}

// TODO ログ推敲
exports.storeState = async function(context) {
	await context.storageState({ path: tmpFile });
	if(isLocal) {
		return;
	}

	const uploadParams = {
		Bucket: BUCKET_NAME,
		Key: path.basename(tmpFile),
		Body: fs.createReadStream(tmpFile)
	};
	try {
		await s3.send(new PutObjectCommand(uploadParams));
		console.log("uploaded authentication state file");
	} catch (err) {
		console.log("authentication state file uploading faild", err);
	}
}

exports.restoreState = async function(browser) {
	if(isLocal){
		return await browser.newContext({ storageState: tmpFile });
	}

	const getParams = {
		Bucket: BUCKET_NAME,
		Key: path.basename(tmpFile)
	};
	try {
		const data = await s3.send(new GetObjectCommand(getParams));
		const ws = fs.createWriteStream(tmpFile);
		data.Body.pipe(ws);
		data.Body.on('end',()=>console.log("downloaded authentication state file"));

		return await browser.newContext({ storageState: tmpFile });
	} catch (err) {
		console.log("authentication state file downloading faild", err);
		return await browser.newContext();
	}
}

exports.hasState = async function() {
	if(isLocal) {
		return fs.existsSync(tmpFile);
	}

	const headParams = {
		Bucket: BUCKET_NAME,
		Key: path.basename(tmpFile)
	};
	try {
		await s3.send(new HeadObjectCommand(headParams));
		return true;
	} catch (err) {
		console.log("authentication state metadata fetch Error", err);
		return false;
	}
}

exports.snapshot = async function(page, label) {
	if(isLocal) {
		const filePath = `.state/snapshot/${label}.png`;
		await page.screenshot({path: filePath});
		console.log(`stored snapshot file at ${filePath}`);
		return;
	}

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

