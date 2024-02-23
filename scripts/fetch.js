require('dotenv').config();
const fs = require('fs');
const puppeteer = require('puppeteer');
const setupRequestInterception = require('./intercept-requests.js');
const replaceAssets = require('./replace-assets.js');
const notionUrl = process.env.NOTION_URL;

let assetsInventory = []; // To keep track of downloaded assets
let htmlAssetsInventory = []; // To keep track of assets used in HTML

(async () => {
	// Launch a new browser session.
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	setupRequestInterception(page, assetsInventory);

	// Go to the Notion page.
	await page.goto(notionUrl, {
		waitUntil: 'networkidle2' // Waits for the network to be idle (no more than 2 connections for at least 500 ms).
		});
	// Wait for a specific element that indicates the page has loaded. Adjust the selector as needed.
	await page.waitForSelector('.notion-collection_view-block .notion-page-block.notion-collection-item[data-block-id="e1fa88c0-63dd-4512-a374-07331667fa0b"]');

	// Get the page content (fetch the page HTML)
	const html = await page.content();
	// replace assets URLs by local paths
	const modifiedHtml = replaceAssets(html, assetsInventory, htmlAssetsInventory);



	// Optionally, compare inventories for unmatched assets
	const downloadedButNotUsed = assetsInventory.filter(asset => !htmlAssetsInventory.some(htmlAsset => htmlAsset.basename === asset.basename));
	const usedButNotDownloaded = htmlAssetsInventory.filter(htmlAsset => !assetsInventory.some(asset => asset.basename === htmlAsset.basename));

	console.log("Downloaded but not used in HTML:", downloadedButNotUsed);
	console.log("Used in HTML but not downloaded:", usedButNotDownloaded);


	// Save the content to an HTML file.
	fs.writeFileSync('./notion-page/index.html', modifiedHtml);

	await browser.close();
})();