const download = require('download');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { logGreen, logRed } = require('./logging.js');


const setupRequestInterception = async (page, assetsInventory) => {

	await page.setRequestInterception(true);
	page.on('request', async (req) => {
		if (['image', 'stylesheet', 'script', 'font'].includes(req.resourceType())) {
			const url = req.url();
			if (!url.startsWith('data:')) {
				const extension = path.extension(url);
				const uid = uuidv4();
				const localFilePath = `./notion-page/assets/${uid}${extension}`;
	
				try {
					await download(url, path.dirname(localFilePath));
					logGreen(`downloaded ${url} to ${localFilePath}`);
					assetsInventory[uid] = { url, uid, extension };
				} catch (error) {
					logRed(`failed to download ${url}`, error.message);
					// console.error(error);
				}
			}
		}
		req.continue();
	});

};

module.exports = setupRequestInterception;