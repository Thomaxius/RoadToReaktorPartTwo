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
        const data: string = fs.readFileSync(filePath, 'UTF-8')
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

        fieldsAndValues
            .filter((_fieldAndValue) => this.isValid(_fieldAndValue))
            .map((validFieldsAndValues) => validFieldsAndValues.split(": ", 2))
            .forEach(([fieldNameInFile, value]) => {
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

            })

        const _package = new Package(argumentsObj);
        return _package;
    }

    static isValid = (_fieldAndValue: string): boolean => _fieldAndValue.length !== 0

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

        dependenciesString = this.removeVersionNumbers(dependenciesString);
        let dependenciesStringArr: string[] = dependenciesString.split(', ');

        for (let dependencyName of dependenciesStringArr) {
            if (dependencies.find((dependency) => dependency.packageName == dependencyName)) {
                console.debug(`Package ${dependencyName} already processed, skipping`);
                continue
            }
            const hasAlternativeDependencies: boolean = dependencyName.indexOf("|") !== -1;

            if (hasAlternativeDependencies) {
                const _dependency: Dependency = this.dependencyWithAlternativeDependencies(dependencyName);
                dependencies.indexOf(_dependency) === -1 && dependencies.push(_dependency);
            } else {
                const _package: Package | undefined = this.getPackageByNameIfExists(dependencyName);
                const _dependency = new Dependency(dependencyName, _package, []);
                dependencies.indexOf(_dependency) === -1 && dependencies.push(_dependency);
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

const fieldNamePropertyEquivalents: { [key: string]: { propertyEquivalent: keyof Package, valueParser?: Function } } = {
    'Package': { propertyEquivalent: 'packageName' },
    'Status': { propertyEquivalent: 'status' },
    'Priority': { propertyEquivalent: 'priority' },
    'Section': { propertyEquivalent: 'section' },
    'Installed-Size': { propertyEquivalent: 'installedSize', valueParser: parseInt },
    'Maintainer': { propertyEquivalent: 'maintainer' },
    'Architecture': { propertyEquivalent: 'architecture' },
    'Version': { propertyEquivalent: 'version' },
    'Description': { propertyEquivalent: 'description', valueParser: PackageParser.parseDescription },
    'Original-Maintainer': { propertyEquivalent: 'originalMaintainer' },
    'Depends': { propertyEquivalent: 'dependenciesString' },
    'Pre-Depends': { propertyEquivalent: 'preDependenciesString' },
    'Source': { propertyEquivalent: 'source' },
    'Multi-Arch': { propertyEquivalent: 'multiArch' },
    'Suggests': { propertyEquivalent: 'suggests' },
    'Homepage': { propertyEquivalent: 'homePage' },
    'Conflicts': { propertyEquivalent: 'conflicts' },
    'Conffiles': { propertyEquivalent: 'confFiles' },
    'Breaks': { propertyEquivalent: 'breaks' },
    'Recommends': { propertyEquivalent: 'recommends' },
    'Provides': { propertyEquivalent: 'provides' },
    'Essential': { propertyEquivalent: 'essential' },
    'Replaces': { propertyEquivalent: 'replaces' },
    'Enhances': { propertyEquivalent: 'enhances' }
};