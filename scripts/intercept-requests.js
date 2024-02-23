const download = require('download');
const path = require('path');
const { logGreen, logRed } = require('./logging.js');


const setupRequestInterception = async (page, assetsInventory) => {

	await page.setRequestInterception(true);
	page.on('request', async (req) => {
		if (['image', 'stylesheet', 'script', 'font'].includes(req.resourceType())) {
			const url = req.url();
			if (!url.startsWith('data:')) {
				const basename = path.basename(url);
				const localFilePath = `./notion-page/assets/${basename}`;
	
				try {
					await download(url, path.dirname(localFilePath));
					logGreen(`x downloaded ${url} to ${localFilePath}`);
					assetsInventory.push({ basename, url, localPath: localFilePath });
				} catch (error) {
					logRed(`o failed to download ${url}`, error.message);
					// console.error(error);
				}
			}
		}
		req.continue();
	});

};

module.exports = setupRequestInterception;