const cheerio = require('cheerio');
const path = require('path');
const { logGreen, logRed } = require('./logging.js');

const replaceAssets = (html, downloadedAssetsObjects, siteOrigin) => {

	let $ = cheerio.load(html);

	const htmlAssetsUrls = []; // To keep track of assets used in HTML

	$('img, script, link').each(function() {
		const tagName = this.tagName.toLowerCase();
		let attribute = tagName === 'link' ? 'href' : 'src';
		let originalUrl = $(this).attr(attribute);
	
		if (!originalUrl) return; // Skip if no URL
		if (originalUrl.startsWith('data:')) return; // Skip if data URL

		// prepend original URL with hostname if needed
		if (originalUrl.startsWith('/')) originalUrl = new URL(originalUrl, siteOrigin).href;

		// Find if this asset was downloaded
		const downloadedAsset = downloadedAssetsObjects.find(({ url }) => url === originalUrl);
		if (downloadedAsset) {
			const { assetNumber, extension } = downloadedAsset;
			const localFileURL = `./assets/${assetNumber}${extension}`;
			// repplace URL in HTML
			$(this).attr(attribute, localFileURL); // Adjust path as needed
			console.log(`\x1b[32mreplaced asset \x1b[4m${originalUrl}\x1b[0m\x1b[32m by \x1b[33m${localFileURL}\x1b[0m`);
			// remove the item from downloadedAssetsObjects
			// delete downloadedAssetsObjects[uid];
			downloadedAssetsObjects = [...downloadedAssetsObjects.filter((downloadedAssetObject) => downloadedAssetObject.assetNumber !== assetNumber )];
		}
		else {
			console.log(`\x1b[31mfailed to replace asset \x1b[4m${originalUrl}\x1b[0m\x1b[31m, no match found\x1b[0m`);
			// const basename = path.basename(originalUrl);
			htmlAssetsUrls.push(originalUrl);
		}
	});
	// Save the modified HTML
	const modifiedHtml = $.html();

	return { htmlAssetsUrls, modifiedHtml };
}

module.exports = replaceAssets;