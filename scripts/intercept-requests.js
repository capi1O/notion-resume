const download = require('download');
const path = require('path');


const setupRequestInterception = async (page) => {

	const downloadedAssetsObjects = []; // keep track of downloaded assets
	const downloadPromisesGenerators = [];
	let assetNumber = 0;

	await page.setRequestInterception(true);
	page.on('request', async (req) => {
		if (['image', 'stylesheet', 'script', 'font'].includes(req.resourceType())) {
			const url = req.url();
			if (!url.startsWith('data:')) {
				const extension = path.extname(url);
				// const uid = uuidv4();
				assetNumber++;
				const localFilePath = `./notion-page/assets/${assetNumber}${extension}`;
				console.log(`asset \x1b[34m${assetNumber}\x1b[0m requested, will download \x1b[4m${url}\x1b[0m to \x1b[33m${localFilePath}\x1b[0m`);
				const _assetNumber = assetNumber; 
				// prepare the promise but do not execute it
				const downloadPromiseGenerator = () =>
					download(url, localFilePath)
					.then((result) => {
						console.log(`\x1b[32masset \x1b[34m#${_assetNumber}\x1b[32m downloaded\x1b[0m`);
						downloadedAssetsObjects.push({ url, assetNumber: _assetNumber, extension });
						// pendingDownloads--;
					})
					.catch((error) => {
						console.log(`\x1b[31masset \x1b[34m#${_assetNumber}\x1b[31m download failed\x1b[0m`, error.message);
						// console.error(error);
					});
					
				downloadPromisesGenerators.push(downloadPromiseGenerator);
			}
		}
		req.continue();
	});

	return { downloadedAssetsObjects, downloadPromisesGenerators };
};

module.exports = setupRequestInterception;