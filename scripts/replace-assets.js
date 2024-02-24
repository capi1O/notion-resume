const cheerio = require('cheerio');
const path = require('path');
const { logGreen, logRed } = require('./logging.js');

const replaceAssets = (html, downloadedAssetsInventory, siteOrigin) => {

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
		const downloadedAsset = Object.values(downloadedAssetsInventory).find(({ url }) => url === originalUrl);
		if (downloadedAsset) {
			const { uid, extension } = downloadedAsset;
			$(this).attr(attribute, `./assets/${uid}${extension}`); // Adjust path as needed
			logGreen(`replaced asset ${originalUrl}`);
			delete downloadedAssetsInventory[uid];
		}
		else {
			logRed(`failed to replace asset ${originalUrl}, no match found`);
			// const basename = path.basename(originalUrl);
			htmlAssetsUrls.push(originalUrl);
		}
	});
	// Save the modified HTML
	const modifiedHtml = $.html();

	return { htmlAssetsUrls, modifiedHtml };
}

module.exports = replaceAssets;