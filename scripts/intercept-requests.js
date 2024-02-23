const download = require('download');
const path = require('path');


const setupRequestInterception = async (page, assetsInventory) => {

	await page.setRequestInterception(true);
	page.on('request', async (req) => {
		if (['image', 'stylesheet', 'script', 'font'].includes(req.resourceType())) {
			const url = req.url();
			const basename = path.basename(url);
			const localFilePath = `/assets/${basename}`;

			try {
				await download(url, path.dirname(localFilePath));
				console.log(`x downloaded ${url} to ${localFilePath}`);
				assetsInventory.push({ basename, url, localPath: localFilePath });
			} catch (e) {
				console.error(`o failed to download ${url}`, e);
			}
		}
		req.continue();
	});

};

module.exports = setupRequestInterception;