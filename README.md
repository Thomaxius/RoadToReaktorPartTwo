# Linux installed packages explorer
A linux installed packages -explorer app built with Node & TypeScript.

[Live demo](http://pkgexplorer.santamaa.com)
[Live demo2 (heroku)](https://pkgexplorer.herokuapp.com/)

# Running
1. Clone the repository
2. Run `npm install`
3. Set path of status file to `app.ts` or create `.env` file with the following line `STATUS_FILE_PATH=/path/to/status/file` If no path is provided, default mock file from `res/` will be used.
4. If you need to change the port the app runs on, you can edit it into `app.ts` or if you're on windows, `package.json`.
4. Run `npm run dev` for development mode, or `npm run prod` if you wish to build the app.

# Endpoints
Two api endpoints are located in:
`/api/single/<packagename>`
`/api/all/`

# Testing
This app contains a few sample tests. You can run them with `npm run test`

