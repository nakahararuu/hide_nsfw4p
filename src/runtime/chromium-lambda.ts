import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import chromium from 'chrome-aws-lambda';
import * as playwright from 'playwright-core';
import * as path from 'path';
import * as fs from 'fs';
import { Readable } from 'stream';
import { ChromiumFunctions } from "./chromium-functions.js";

// TODO 環境変数から取得
const s3 = new S3Client({ region: "ap-northeast-1" });

const { BUCKET_NAME } = process.env;
const tmpStateFile = '/tmp/state.json';

export const openBrowser: ChromiumFunctions['openBrowser'] = async () => {
	await chromium.font('https://fonts.gstatic.com/ea/notosansjapanese/v6/NotoSansJP-Regular.woff2');

	return await playwright.chromium.launch({
		args: chromium.args,
		executablePath: await chromium.executablePath,
		headless: chromium.headless,
	});
}

export const storeState: ChromiumFunctions['storeState'] = async (context) => {
	await context.storageState({ path: tmpStateFile });

	const uploadParams = {
		Bucket: BUCKET_NAME,
		Key: path.basename(tmpStateFile),
		Body: fs.createReadStream(tmpStateFile)
	};

	try {
		await s3.send(new PutObjectCommand(uploadParams));
	} catch (err) {
		console.error("authentication state file uploading failed", err);
	}
}

export const restoreState: ChromiumFunctions['restoreState'] = async (browser) => {
	console.log('authentication state file found. trying to restore it.')
	try {
		await getS3Object(path.basename(tmpStateFile), tmpStateFile);
		return await browser.newContext({ storageState: tmpStateFile });
	} catch (err) {
		console.error(`failed to download authentication file from S3`, err);
		return await browser.newContext();
	}
}

async function getS3Object(key: string, destPath: string) {
	const data = await s3.send(new GetObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key
	}));

	return new Promise<void>((resolve, reject) => {
		const ws = fs.createWriteStream(destPath);
		ws.on('finish', () => resolve());
		ws.on('error', (err) => reject(err));
		(data.Body as Readable).pipe(ws);
	});
};

export const hasState: ChromiumFunctions['hasState'] = async () => {
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

export const snapshot: ChromiumFunctions['snapshot'] = async (page, label) => {
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
	} catch (err) {
		console.error("snapshot file uploading failed", err);
	}
}

