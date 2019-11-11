import { Dependency } from "./dependency";

export type ExtraFields = {
    fieldName: string;
    value: string;
};

export type Description = {
    synopsis: string;
    longDescription: string;
};

export class Package {

    public packageName: string;
    public source?: string;
    public version: string;
    public section: string;
    public priority: string;
    public architecture: string;
    public essential?: string;
    public dependencies: Dependency[] = [];
    public dependingPackageNames: string[] = []; // Exists because we cannot serialize dependingPackages when JSON'ing
    public dependingPackages: Package[] = [];
    public dependenciesString?: string;
    public preDependenciesString?: string;
    public recommends?: string;
    public suggests?: string;
    public enhances?: string;
    public preDependencies: Dependency[] = [];
    public installedSize: number;
    public maintainer: string;
    public homePage?: string;
    public description: Description;
    public status: string;
    public multiArch?: string;
    public replaces?: string;
    public provides?: string;
    public conflicts?: string;
    public confFiles?: string;
    public breaks?: string;
    public originalMaintainer?: string;
    public providesString?: string;
    public extraFields: ExtraFields[] = []


    constructor(obj: any) {
        this.packageName = obj.packageName;
        this.status = obj.status;
        this.priority = obj.priority;
        this.section = obj.section;
        this.installedSize = obj.installedSize;
        this.maintainer = obj.maintainer;
        this.architecture = obj.architecture;
        this.version = obj.version;
        this.description = obj.description;
        this.source = obj.source;
        this.multiArch = obj.multiArch;
        this.essential = obj.essential;
        this.dependingPackageNames = obj.dependingPackageNames;
        this.dependingPackages = obj.dependingPackages;
        this.dependencies = obj.dependencies;
        this.preDependencies = obj.preDependencies;
        this.replaces = obj.replaces;
        this.provides = obj.provides;
        this.dependenciesString = obj.dependenciesString;
        this.preDependenciesString = obj.preDependenciesString;
        this.recommends = obj.recommends;
        this.conflicts = obj.conflicts;
        this.confFiles = obj.confFiles;
        this.suggests = obj.suggests;
        this.breaks = obj.breaks;
        this.originalMaintainer = obj.originalMaintainer;
        this.homePage = obj.homePage;
        this.breaks = obj.breaks;
        this.enhances = obj.enhances;
        this.providesString = obj.providesString;
        this.extraFields = obj.extraFields;
    };

    public getPackageName(): string {
        return this.packageName;
    };

    public setPackageName(packageName: string) {
        this.packageName = packageName;
    };

    public getDependingPackageNames(): string[] {
        return this.dependingPackageNames;
    };

    public setDependingPackageNames(dependingPackageNames: string[]) {
        this.dependingPackageNames = dependingPackageNames;
    };

    public getDependencies(): Dependency[] {
        return this.dependencies;
    };

    public setDependencies(dependencies: Dependency[]) {
        this.dependencies = dependencies;
    };

    public getPreDependencies(): Dependency[] {
        return this.preDependencies;
    };

    public setPreDependencies(preDependencies: Dependency[]) {
        this.preDependencies = preDependencies;
    };

    public getDependenciesString(): string | undefined {
        return this.dependenciesString;
    };

    public setDependenciesString(dependenciesString: string) {
        this.dependenciesString = dependenciesString;
    };

    public getPreDependenciesString(): string | undefined {
        return this.dependenciesString;
    };

    public setPreDependenciesString(dependenciesString: string) {
        this.dependenciesString = dependenciesString;
    };

    /* Workaround for JSON serializing, add fields here that you wish to serialize into JSON */
    public getDTO(): Object {
        return {
            packageName: this.packageName,
            source: this.source,
            version: this.version,
            section: this.section,
            priority: this.priority,
            architecture: this.architecture,
            essential: this.essential,
            dependencies: this.dependencies,
            recommends: this.recommends,
            suggests: this.suggests,
            enhances: this.enhances,
            preDependencies: this.preDependencies,
            installedSize: this.installedSize,
            maintainer: this.maintainer,
            homePage: this.homePage,
            description: this.description,
            status: this.status,
            multiArch: this.multiArch,
            dependingPackageNames: this.dependingPackageNames,
            replaces: this.replaces,
            provides: this.provides,
            conflicts: this.conflicts,
            confFiles: this.confFiles,
            breaks: this.breaks,
            originalMaintainer: this.originalMaintainer,
            providesString: this.providesString,
            extraFields: this.extraFields
        };
    };

    toJSON(): Object {
        return this.getDTO();
    };
};
