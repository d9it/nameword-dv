const { Storage } = require("@google-cloud/storage");
const path = require("path");
const env = require("../../start/env");
const { Logger } = require('./logger');

const fs = require("fs");

const filePath = path.resolve(__dirname, '../../config/service-account.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

data.private_key_id = process.env.PRIVATE_KEY_ID;
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

const keyFilePath = path.join(__dirname, "../../config/service-account.json");
const storage = new Storage({
	keyFilename: keyFilePath,
});
const BUCKET_NAME = env.GCLOUD_STORAGE_BUCKET_NAME;

async function uploadFile(file) {
	try {
		const extension = file.originalname.split(".").pop();
		const destination = `profile_img/${file.filename}.${extension}`;
		const options = {
			destination,
		};
		const filePath = file.path.replace(/\\/g, "/");
		return await storage.bucket(BUCKET_NAME).upload(filePath, options);
	} catch (error) {
		Logger.error("Error uploading file to Google Cloud Storage:", error);
	}
}

async function deleteFile(filename) {
	try {
		const result = await storage
			.bucket(BUCKET_NAME)
			.file(filename)
			.delete();
		return result;
	} catch (error) {
		Logger.error("Error deleting file from Google Cloud Storage:", error);
		return false;
	}
}

async function getSignedURL(path) {
	try {
		const file = storage.bucket(BUCKET_NAME).file(path);

		const [exists] = await file.exists();
		if (!exists) {
			return null; // or throw an error
		}
		const options = {
			version: "v4",
			action: "read",
			expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
			responseType: "image/jpeg",
			responseDisposition: "inline",
		};

		const [url] = await storage
			.bucket(BUCKET_NAME)
			.file(path)
			.getSignedUrl(options);
		return url;
	} catch (error) {
		Logger.error("Error getting signed URL from Google Cloud Storage:", error);
	}
}

module.exports = {
	uploadFile,
	getSignedURL,
	deleteFile,
};
