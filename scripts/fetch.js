require('dotenv').config();
const fs = require('fs');
const puppeteer = require('puppeteer');
const setupRequestInterception = require('./intercept-requests.js');
const replaceAssets = require('./replace-assets.js');
const notionUrl = process.env.NOTION_URL;

(async () => {
	// Launch a new browser session.
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	
	// prepare to listen for requests. returned vars are populated as the requests are received
	const { downloadedAssetsInventory, downloadPromisesGenerators } = await setupRequestInterception(page);

	console.log('\n\n\n============');
	console.log('Step 1: Load page');
	// Waits for the network to be idle (no more than 2 connections for at least 500 ms).
	await page.goto(notionUrl, { waitUntil: 'networkidle2' });
	// Wait for a specific element that indicates the page has loaded. Adjust the selector as needed.
	await page.waitForSelector('.notion-collection_view-block .notion-page-block.notion-collection-item[data-block-id="e1fa88c0-63dd-4512-a374-07331667fa0b"]');

	console.log('Step 2: Download the assets');
	await Promise.all(downloadPromisesGenerators.map(downloadPromise => downloadPromise())); // execute the promises

	// replace assets URLs by local paths
	console.log('\n\n\n============');
	console.log('Step 3: Replace assets in HTML');
	const html = await page.content(); // Get the page content (fetch the page HTML)
	const notionSiteOrigin = new URL(notionUrl).origin;
	const { htmlAssetsUrls, modifiedHtml } = replaceAssets(html, downloadedAssetsInventory, notionSiteOrigin);

	// Optionally, compare inventories for unmatched assets
	console.log('\n\n\n============');
	console.log('Downloaded but not used in HTML:', Object.values(downloadedAssetsInventory).map(({ url }) => url));
	console.log('\n\n\n============');
	console.log("Used in HTML but not downloaded:", htmlAssetsUrls);


	// Save the content to an HTML file.
	fs.writeFileSync('./notion-page/index.html', modifiedHtml);

	await browser.close();
})();