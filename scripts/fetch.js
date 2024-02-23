require('dotenv').config();
const { exec } = require('child_process');
const notionUrl = process.env.NOTION_URL;

exec(`curl "${notionUrl}" -o notion-page/index.html`, (error, stdout, stderr) => {
	if (error) {
		console.error(`exec error: ${error}`);
		return;
	}
	console.log(`stdout: ${stdout}`);
	console.error(`stderr: ${stderr}`);
});