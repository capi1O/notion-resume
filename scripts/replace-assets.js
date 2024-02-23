const cheerio = require('cheerio');
const path = require('path');

const replaceAssets = (html, assetsInventory, htmlAssetsInventory) => {

	let $ = cheerio.load(html);

	$('img, script, link').each(function() {
		const tagName = this.tagName.toLowerCase();
		let attribute = tagName === 'link' ? 'href' : 'src';
		let originalUrl = $(this).attr(attribute);
		if (!originalUrl) return; // Skip if no URL

		const basename = path.basename(originalUrl);
		htmlAssetsInventory.push({ basename, url: originalUrl });

		// Find if this asset was downloaded
		const foundAsset = assetsInventory.find(asset => asset.url === originalUrl);
		if (foundAsset) {
			$(this).attr(attribute, `/assets/${basename}`); // Adjust path as needed
		}
	});
	// Save the modified HTML
	const modifiedHtml = $.html();

	return modifiedHtml;
}

module.exports = replaceAssets;