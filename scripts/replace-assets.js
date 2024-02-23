const cheerio = require('cheerio');
const path = require('path');
const { logGreen, logRed } = require('./logging.js');

const replaceAssets = (html, downloadedAssetsInventory, htmlAssetsInventory) => {

	let $ = cheerio.load(html);

	$('img, script, link').each(function() {
		const tagName = this.tagName.toLowerCase();
		let attribute = tagName === 'link' ? 'href' : 'src';
		let originalUrl = $(this).attr(attribute);
		if (!originalUrl) return; // Skip if no URL
		if (originalUrl.startsWith('data:')) return; // Skip if data URL

		const basename = path.basename(originalUrl);
		htmlAssetsInventory.push({ basename, url: originalUrl });

		// Find if this asset was downloaded
		const foundAsset = downloadedAssetsInventory.find(asset => asset.url === originalUrl);
		if (foundAsset) {
			$(this).attr(attribute, `./assets/${basename}`); // Adjust path as needed
			logGreen(`replaced asset ${originalUrl}`);
		}
		else logRed(`failed to replace asset ${originalUrl}, no match found`);
	});
	// Save the modified HTML
	const modifiedHtml = $.html();

	return modifiedHtml;
}

module.exports = replaceAssets;