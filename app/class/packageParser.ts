import { Package, Description, ExtraFields } from "./package";
import { Dependency } from "./dependency";
import { AlternativeDependency } from "./alternativeDependency";
const fs = require('fs');

export abstract class PackageParser {

    static _packages: Package[] = [];

    static fromStatusFile(filePath: string): Package[] {
        try {
            const rawFileData: string = this.fromFile(filePath);
            this._packages = this.fromFileContents(rawFileData);
            return this._packages;
        }
        catch (error) {
            throw new Error(error);
        }
    };

    static fromFile(filePath: string): string {
        let data: Buffer | string = fs.readFileSync(filePath, 'UTF-8');
        data = data.toString()
        if (data.length === 0) {
            throw new Error('File is empty');
        }
        if (this.hasWindowsLineEndings(data)) {
            console.warn("Warning: loaded file contains windows-style line endings. Convert to Linux (LF) if there are problems.")
        }
        return data;
    };

    static hasWindowsLineEndings(data: string) {
        return data[data.search(/\r\n/)] !== undefined
    }

    static fromFileContents(fileContents: string): Package[] {
        const rawDataPerPackage: string[] = fileContents.split('\n\n');
        this._packages = this.fromRawDataArr(rawDataPerPackage);
        this.handleDependencies(this._packages);
        this.sortedAlphabetically(this._packages);
        return this._packages;
    };

    static fromRawDataArr(stringArr: string[]): Package[] {
        let packages: Package[] = [];
        for (let packageItem of stringArr) {
            if (!this.isValidPackage(packageItem)) {
                console.debug(`Invalid package, skipping. stringified packageItem: "${JSON.stringify(packageItem)}", length: ${packageItem.length}`);
                continue;
            }
            const fieldsAndValues: string[] = packageItem.split(/\n(?!\s)/);
            const _package: Package = this.fromFieldsAndValues(fieldsAndValues);
            packages.push(_package);
        };
        return packages;
    };

    static isValidPackage(packageItem: string) {
        return (packageItem.replace(/\n/g, '').length !== 0);
    }

    static fromFieldsAndValues(fieldsAndValues: string[]): Package {

        let argumentsObj = {} as any;
        const extraFields: ExtraFields[] = [];
        argumentsObj.extraFields = extraFields;

        for (const fieldAndValue of fieldsAndValues) {
            if (fieldAndValue.length === 0) {
                console.debug(`Skipping field, is empty`)
                continue
            }
            const delimeterIndex = fieldAndValue.indexOf(':');
            const fieldNameInFile = fieldAndValue.substring(0, delimeterIndex);
            let value = fieldAndValue.substring(delimeterIndex + 2);
            const propertyEquivalentObj = fieldNamePropertyEquivalents[fieldNameInFile];
            if (propertyEquivalentObj) {
                const propertyName = propertyEquivalentObj.propertyEquivalent;
                const valueParser = propertyEquivalentObj.valueParser;
                if (valueParser) {
                    value = valueParser(value);
                }
                argumentsObj[propertyName] = value;
            } else {
                argumentsObj['extraFields'].push({ fieldName: fieldNameInFile, value: value });
            }
        }

        const _package = new Package(argumentsObj);
        return _package;
    }

    static handleDependencies(packages: Package[]): void {
        this.createDependencies(packages);
        this.updateDependingPackages(packages);
    };

    static createDependencies(packages: Package[]) {
        packages.forEach((_package) => {
            const preDependencies: Dependency[] = this.dependenciesFromString(_package.preDependenciesString);
            const dependencies: Dependency[] = this.dependenciesFromString(_package.dependenciesString);
            _package.preDependencies = preDependencies;
            _package.dependencies = dependencies;
        }
        );
    };

    static dependenciesFromString(dependenciesString: string | undefined): Dependency[] {
        if (!dependenciesString) {
            return [];
        };
        let dependencies: Dependency[] = [];
        ;
        dependenciesString = this.removeVersionNumbers(dependenciesString);
        let dependenciesStringArr: string[] = dependenciesString.split(', ');

        for (let dependencyName of dependenciesStringArr) {
            if (dependencies.find((dependency) => dependency.packageName == dependencyName)) {
                console.debug(`Package ${dependencyName} already processed, skipping`);
                continue
            }
            const hasAlternativeDependencies: boolean = dependencyName.indexOf("|") !== -1;

            switch (hasAlternativeDependencies) {
                case true: {
                    const _dependency: Dependency = this.dependencyWithAlternativeDependencies(dependencyName);
                    dependencies.indexOf(_dependency) === -1 && dependencies.push(_dependency);
                    break;
                };
                case false: {
                    const _package: Package | undefined = this.getPackageByNameIfExists(dependencyName);
                    const _dependency = new Dependency(dependencyName, _package, []);
                    dependencies.indexOf(_dependency) === -1 && dependencies.push(_dependency);
                    break;
                };
            };
        };
        return dependencies;
    };

    static removeVersionNumbers(dependencies: string): string {
        return dependencies.replace(/\s\(.*?\)/g, '');
    };

    static dependencyWithAlternativeDependencies(dependencyName: string): Dependency {
        let alternativeDependencyNames: string[] = dependencyName.split(" | ");
        const dependencyToAddAlternativesToName = alternativeDependencyNames[0];

        const _package: Package | undefined = this.getPackageByNameIfExists(dependencyToAddAlternativesToName);

        let _dependency: Dependency = new Dependency(dependencyToAddAlternativesToName, _package, []);

        for (let _alternativeDependencyName of alternativeDependencyNames.splice(1, alternativeDependencyNames.length)) {
            const _package: Package | undefined = this.getPackageByNameIfExists(_alternativeDependencyName);
            const _alternativeDependency = new AlternativeDependency(_alternativeDependencyName, _package);
            _dependency.addAlternatives(_alternativeDependency);
        };
        return _dependency;
    };

    static updateDependingPackages(packages: Package[]) {
        packages.forEach((_package) => {
            const dependingPackages: Package[] = this.getDependingPackages(_package.packageName);
            const dependingPackageNames: string[] = dependingPackages.map((_package) => _package.packageName) as string[];
            _package.dependingPackageNames = dependingPackageNames;
            _package.dependingPackages = dependingPackages;
        });
    };

    static getPackageByNameIfExists(packageName: string): Package | undefined {
        const foundPackage = this._packages.find((_package) => _package.packageName === packageName) as Package | undefined;
        return foundPackage ? foundPackage : undefined;
    };

    static getDependingPackages(packageNameForUpdating: string): Package[] | [] {
        const dependingPackagesArr: Package[] = [];

        for (const _package of this._packages) {
            for (const dependency of _package.dependencies) {
                if (dependency.packageName === packageNameForUpdating) {
                    dependingPackagesArr.push(_package);
                    continue;
                }
                for (const alternativeDependency of dependency.alternatives) {
                    if (alternativeDependency.packageName === packageNameForUpdating) {
                        dependingPackagesArr.push(_package);
                        continue;
                    }
                }
            }
        }
        return dependingPackagesArr;
    };

    static sortedAlphabetically(packages: Package[]): Package[] {
        return packages.sort((a, b) => a.packageName.localeCompare(b.packageName));
    };

    static parseDescription(description: string): Description {
        const synopsisEndIndex = description.indexOf("\n");
        const synopsis = description.substring(0, synopsisEndIndex);
        let longDescription = description.substring(synopsisEndIndex + 2);

        return { synopsis: synopsis, longDescription: longDescription };
    };
};

const fieldNamePropertyEquivalents: { [key: string]: { propertyEquivalent: keyof Package, valueParser: Function | undefined } } = {
    'Package': { propertyEquivalent: 'packageName', valueParser: undefined },
    'Status': { propertyEquivalent: 'status', valueParser: undefined },
    'Priority': { propertyEquivalent: 'priority', valueParser: undefined },
    'Section': { propertyEquivalent: 'section', valueParser: undefined },
    'Installed-Size': { propertyEquivalent: 'installedSize', valueParser: parseInt },
    'Maintainer': { propertyEquivalent: 'maintainer', valueParser: undefined },
    'Architecture': { propertyEquivalent: 'architecture', valueParser: undefined },
    'Version': { propertyEquivalent: 'version', valueParser: undefined },
    'Description': { propertyEquivalent: 'description', valueParser: PackageParser.parseDescription },
    'Original-Maintainer': { propertyEquivalent: 'originalMaintainer', valueParser: undefined },
    'Depends': { propertyEquivalent: 'dependenciesString', valueParser: undefined },
    'Pre-Depends': { propertyEquivalent: 'preDependenciesString', valueParser: undefined },
    'Source': { propertyEquivalent: 'source', valueParser: undefined },
    'Multi-Arch': { propertyEquivalent: 'multiArch', valueParser: undefined },
    'Suggests': { propertyEquivalent: 'suggests', valueParser: undefined },
    'Homepage': { propertyEquivalent: 'homePage', valueParser: undefined },
    'Conflicts': { propertyEquivalent: 'conflicts', valueParser: undefined },
    'Conffiles': { propertyEquivalent: 'confFiles', valueParser: undefined },
    'Breaks': { propertyEquivalent: 'breaks', valueParser: undefined },
    'Recommends': { propertyEquivalent: 'recommends', valueParser: undefined },
    'Provides': { propertyEquivalent: 'provides', valueParser: undefined },
    'Essential': { propertyEquivalent: 'essential', valueParser: undefined },
    'Replaces': { propertyEquivalent: 'replaces', valueParser: undefined },
    'Enhances': { propertyEquivalent: 'enhances', valueParser: undefined }
};