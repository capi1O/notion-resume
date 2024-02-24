const download = require('download');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { logGreen, logRed } = require('./logging.js');


const setupRequestInterception = async (page, assetsInventory) => {

	const downloadCompletePromises = [];
	let assetNumber = 0;
	await page.setRequestInterception(true);
	page.on('request', async (req) => {
		if (['image', 'stylesheet', 'script', 'font'].includes(req.resourceType())) {
			const url = req.url();
			if (!url.startsWith('data:')) {
				const extension = path.extname(url);
				const uid = uuidv4();
				const localFilePath = `./notion-page/assets/${uid}${extension}`;
	
				assetNumber++;
				console.log(`asset #${assetNumber} requested, will download "${url}" to "${localFilePath}"`);
				const _assetNumber = assetNumber; 
				const downloadPromise = download(url, path.dirname(localFilePath))
				.then((result) => {
					logGreen(`asset #${_assetNumber} downloaded`);
					assetsInventory[uid] = { url, uid, extension };
					// pendingDownloads--;
				})
				.catch((error) => {
					logRed(`asset #${_assetNumber} download failed`, error.message);
					// console.error(error);
				});
					
				downloadCompletePromises.push(downloadPromise);
			}
		}
		req.continue();
	});

	return downloadCompletePromises;
};

module.exports = setupRequestInterception;