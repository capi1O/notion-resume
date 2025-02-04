# How to use

0. Install dependancies: `npm install`
1. Set notion page url in `.env` file (`https://<username>.notion.site/xyz`)
2. Fetch Notion page: `npm run fetch`

# Add HTML block to Notion Page

0. Place HTML files in `/docs` directory
1. Go to this repo "Github Pages" settings at `https://github.com/<username>/notion-resume/settings/pages`
2. Choose master branch and folder `/docs` and wait for a bit (should not be long)
3. Copy the Github Page URL `https://<username>.github.io/notion-resume/<filename>.html`
4. Add a Notion "Embed" block and paste this URL
