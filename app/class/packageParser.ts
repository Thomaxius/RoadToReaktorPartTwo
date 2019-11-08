import { Package, Description, ExtraFields } from "./package";
import { Dependency } from "./dependency";
import { AlternativeDependency } from "./alternativeDependency";
const fs = require('fs');

export namespace PackageParser {

    export const fromStatusFile = (filePath: string): Package[] => {
        try {
            const rawFileData: string = fromFile(filePath);
            const packages: Package[] = fromFileContents(rawFileData);
            return packages;
        }
        catch (error) {
            throw new Error(error);
        }
    };

    const fromFile = (filePath: string): string => {
        const data: string = fs.readFileSync(filePath, 'UTF-8')
        if (data.length === 0) {
            throw new Error('File is empty');
        }
        if (hasWindowsLineEndings(data)) {
            console.warn("Warning: loaded file contains windows-style line endings. Convert to Linux (LF) if there are problems.")
        }
        return data;
    };

    const hasWindowsLineEndings = (data: string) => {
        return data[data.search(/\r\n/)] !== undefined
    }

    const fromFileContents = (fileContents: string): Package[] => {
        const rawDataPerPackage: string[] = fileContents.split('\n\n');
        const packages: Package[] = fromRawDataArr(rawDataPerPackage);
        handleDependencies(packages);
        sortedAlphabetically(packages);
        return packages;
    };

    const fromRawDataArr = (stringArr: string[]): Package[] => {
        let packages: Package[] = [];
        stringArr
            .filter((packageItem) => isValidPackage(packageItem))
            .map((validPackageItem) => splitAtEOL(validPackageItem))
            .forEach((fieldsAndValues) => packages.push(fromFieldsAndValues(fieldsAndValues)))
        return packages;
    };

    const isValidPackage = (packageItem: string): boolean => {
        return (packageItem.replace(/\n/g, '').length !== 0);
    }

    const splitAtEOL = (packageItem: string): string[] => packageItem.split(/\n(?!\s)/);

    const fromFieldsAndValues = (fieldsAndValues: string[]): Package => {

        let argumentsObj = {} as any;
        const extraFields: ExtraFields[] = [];
        argumentsObj.extraFields = extraFields;

        fieldsAndValues
            .filter((_fieldAndValue) => isValid(_fieldAndValue))
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

    const isValid = (_fieldAndValue: string): boolean => _fieldAndValue.length !== 0

    const handleDependencies = (packages: Package[]): void => {
        createDependencies(packages);
        updateDependencyStatus(packages);
        updateDependingPackages(packages);
    };

    const createDependencies = (packages: Package[]) => {
        packages.forEach((_package) => {
            const preDependencies: Dependency[] = dependenciesFromString(_package.preDependenciesString);
            const dependencies: Dependency[] = dependenciesFromString(_package.dependenciesString);
            _package.preDependencies = preDependencies;
            _package.dependencies = dependencies;
        }
        );
    };

    const dependenciesFromString = (dependenciesString: string | undefined): Dependency[] => {
        if (!dependenciesString) {
            return [];
        };
        let dependencies: Dependency[] = [];

        dependenciesString = removeVersionNumbers(dependenciesString);
        let dependenciesStringArr: string[] = dependenciesString.split(', ');

        for (let dependencyName of dependenciesStringArr) {
            if (dependencies.find((dependency) => dependency.packageName == dependencyName)) {
                console.debug(`Package ${dependencyName} already processed, skipping`);
                continue
            }
            const hasAlternativeDependencies: boolean = dependencyName.indexOf("|") !== -1;

            if (hasAlternativeDependencies) {
                const _dependency: Dependency = dependencyWithAlternativeDependencies(dependencyName);
                dependencies.indexOf(_dependency) === -1 && dependencies.push(_dependency);
            } else {
                const _dependency = new Dependency(dependencyName);
                dependencies.indexOf(_dependency) === -1 && dependencies.push(_dependency);
            };
        };
        return dependencies;
    };

    const dependencyWithAlternativeDependencies = (dependencyName: string): Dependency => {
        let dependencyNames: string[] = dependencyName.split(" | ");
        const dependencyToAddAlternativesToName = dependencyNames[0] as string
        const alternativeDependencyNames = dependencyNames.splice(1, dependencyNames.length)

        let _dependency: Dependency = new Dependency(dependencyToAddAlternativesToName);

        for (let _alternativeDependencyName of alternativeDependencyNames) {
            const _alternativeDependency = new AlternativeDependency(_alternativeDependencyName);
            _dependency.addAlternatives(_alternativeDependency);
        };

        return _dependency;
    };

    const updateDependencyStatus = (packages: Package[]) => {
        packages
            .forEach((_package) => [_package.dependencies, _package.preDependencies]
                .forEach((joinedDependencies) => joinedDependencies
                    .forEach((dependency) => [joinedDependencies, dependency.alternatives]
                        .forEach((joinedDependencies) => joinedDependencies
                            .forEach((dependency: Dependency | AlternativeDependency) => {

                                const _package: Package | undefined = getPackageByNameIfExists(packages, dependency.packageName)
                                if (_package) {
                                    dependency.isInstalled = true
                                    dependency._package = _package
                                }
                            })))))
    }

    const updateDependingPackages = (packages: Package[]) => {
        packages.forEach((_package) => {
            const dependingPackages: Package[] = getDependingPackages(packages, _package.packageName);
            const dependingPackageNames: string[] = dependingPackages.map((_package) => _package.packageName) as string[];
            _package.dependingPackageNames = dependingPackageNames;
            _package.dependingPackages = dependingPackages;
        });
    };

    const getDependingPackages = (packages: Package[], packageNameForUpdating: string): Package[] | [] => {
        const dependingPackagesArr: Package[] = []

        packages
            .forEach((_package) => _package.dependencies
                .forEach((dependency) => [_package.dependencies, dependency.alternatives]
                    .forEach((joinedDependencies) => joinedDependencies
                        .forEach((dependency: Dependency | AlternativeDependency) => {
                            if (dependency.packageName === packageNameForUpdating) {
                                dependingPackagesArr.push(_package);
                            }
                        }))))
        return dependingPackagesArr;
    };

    const getPackageByNameIfExists = (packages: Package[], packageName: string): Package | undefined => {
        const foundPackage = packages.find((_package) => _package.packageName === packageName) as Package | undefined;
        return foundPackage ? foundPackage : undefined;
    };

    const removeVersionNumbers = (dependencies: string): string => {
        return dependencies.replace(/\s\(.*?\)/g, '');
    };

    const sortedAlphabetically = (packages: Package[]): Package[] => {
        return packages.sort((a, b) => a.packageName.localeCompare(b.packageName));
    };

    const parseDescription = (description: string): Description => {
        const synopsisEndIndex = description.indexOf("\n");
        const synopsis = description.substring(0, synopsisEndIndex);
        let longDescription = description.substring(synopsisEndIndex + 2);

        return { synopsis: synopsis, longDescription: longDescription };
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
        'Description': { propertyEquivalent: 'description', valueParser: parseDescription },
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
};

