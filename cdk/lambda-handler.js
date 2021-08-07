import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

import * as path from "path";
import * as fs from "fs";

// Create an Amazon S3 service client object.
const s3 = new S3Client({ region: "ap-northeast-1" });

// const
const file = "/tmp/state.json";
const { BUCKET_NAME } = process.env;

exports.handler =  async function(event, context) {
	// Upload file to specified bucket.
	const uploadParams = {
		Bucket: BUCKET_NAME,
		Key: path.basename(file),
		//Body: fs.createReadStream(file)
		Body: "uhoho"
	};
	try {
		const data = await s3.send(new PutObjectCommand(uploadParams));
		console.log("upload done", data);
	} catch (err) {
		console.log("Error", err);
	}

	// Download file from specified bucket.
	const getParams = {
		Bucket: BUCKET_NAME,
		Key: path.basename(file)
	};
	try {
		const data = await s3.send(new GetObjectCommand(getParams));
		console.log("download done", data);

		const ws = fs.createWriteStream(file);
		data.Body.pipe(ws);
		data.Body.on('end',()=>console.log('write file done'));
	} catch (err) {
		console.log("Error", err);
	}
};
