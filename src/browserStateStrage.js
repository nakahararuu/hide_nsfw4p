const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");

const path = require("path");
const fs = require("fs");

// TODO 環境変数から取得
const s3 = new S3Client({ region: "ap-northeast-1" });

const { BUCKET_NAME, RUN_LOCALLY } = process.env;
const isLocal = (RUN_LOCALLY == 'true');
const tmpFile = isLocal ? ".state/state.json" : "/tmp/state.json";

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
		const data = await s3.send(new PutObjectCommand(uploadParams));
		console.log("upload done", data);
	} catch (err) {
		console.log("Error", err);
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
		console.log("download done", data);

		const ws = fs.createWriteStream(tmpFile);
		data.Body.pipe(ws);
		data.Body.on('end',()=>console.log('write file done'));

		return await browser.newContext({ storageState: tmpFile });
	} catch (err) {
		console.log("Error", err);
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
		await s3.send(new HeadObjectCommand());
		return true;
	} catch (err) {
		return false;
	}
}

