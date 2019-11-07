import express = require('express');
import { Package } from './class/package';
import { HtmlPage, singlePackageTemplate, listingPageTemplate, errorPageTemplate } from './handlebars';
import { PackageParser } from './class/packageParser';

const PORT = process.env.PORT || 3000;
const STATUS_FILE_PATH = process.env.STATUS_FILE_PATH || `res/status.real`;

function main(): void {
    let packages: Package[] = [];

    try {
        const app: express.Application = express();
        packages = PackageParser.fromStatusFile(STATUS_FILE_PATH);

        app.get('/api/single/:package/', function (req, res): void {
            const requestedPackage: string = req.params.package;
            const existingPackage: Package | undefined = packages.find((packageObj) => packageObj.packageName === requestedPackage);
            const json = JSON.stringify(existingPackage);
            if (existingPackage) {
                res.send(json);
            } else {
                res.send(404);
            };
        });

        app.get('/api/all/', function (req, res): void {
            const json = JSON.stringify(packages)
            res.send(json);
        });

        app.get('/package/:package/', function (req, res): void {
            let page: HtmlPage;
            let json: string;
            const requestedPackage: string = req.params.package;
            const existingPackage: Package | undefined = packages.find((packageObj) => packageObj.packageName === requestedPackage);
            if (existingPackage) {
                json = JSON.stringify(existingPackage);
                page = new HtmlPage(json, singlePackageTemplate);
            } else {
                page = new HtmlPage("{}", errorPageTemplate);
            };
            res.send(page.html);
        });

        app.get('/', function (req, res): void {
            const json = JSON.stringify(packages);
            const page: HtmlPage = new HtmlPage(json, listingPageTemplate);
            res.send(page.html);
        });

        app.get('/*', function (req, res): void {
            const page: HtmlPage = new HtmlPage("{}", errorPageTemplate);
            res.send(page.html);
        });

        app.listen(PORT, () => {
            console.log(`listening on port ${PORT}`);
        });

    }
    catch (error) {
        throw new Error(error);
    };
};

main();