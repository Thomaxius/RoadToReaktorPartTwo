import { Dependency } from "./dependency";

export type ExtraFields = {
    fieldName: string;
    value: string;
};

export type Description = {
    synopsis: string;
    longDescription: string;
};

export interface PackageConstructor {
    packageName: string;
    source?: string;
    version: string;
    section: string;
    priority: string;
    architecture: string;
    essential?: string;
    dependencies: Dependency[];
    dependingPackageNames: string[]; // Exists because we cannot serialize dependingPackages when JSON'ing
    dependingPackages: Package[];
    dependenciesString?: string;
    preDependenciesString?: string;
    recommends?: string;
    suggests?: string;
    enhances?: string;
    preDependencies: Dependency[];
    installedSize: number;
    maintainer: string;
    homePage?: string;
    description: Description;
    status: string;
    multiArch?: string;
    replaces?: string;
    provides?: string;
    conflicts?: string;
    confFiles?: string;
    breaks?: string;
    originalMaintainer?: string;
    providesString?: string;
    extraFields: ExtraFields[];
}

export class Package {

    private _packageName: string;
    private _source?: string;
    private _version: string;
    private _section: string;
    private _priority: string;
    private _architecture: string;
    private _essential?: string;
    private _dependencies: Dependency[] = [];
    private _dependingPackageNames: string[] = []; // Exists because we cannot serialize dependingPackages when JSON'ing
    private _dependingPackages: Package[] = [];
    private _dependenciesString?: string;
    private _preDependenciesString?: string;
    private _recommends?: string;
    private _suggests?: string;
    private _enhances?: string;
    private _preDependencies: Dependency[] = [];
    private _installedSize: number;
    private _maintainer: string;
    private _homePage?: string;
    private _description: Description;
    private _status: string;
    private _multiArch?: string;
    private _replaces?: string;
    private _provides?: string;
    private _conflicts?: string;
    private _confFiles?: string;
    private _breaks?: string;
    private _originalMaintainer?: string;
    private _providesString?: string;
    private _extraFields: ExtraFields[] = []


    constructor(obj: PackageConstructor) {
        if (!isValidPackageConstructor(obj)) {
            throw new TypeError(`Invalid object passed to constructor: ${JSON.stringify(obj)}`)
        }
        this._packageName = obj.packageName;
        this._status = obj.status;
        this._priority = obj.priority;
        this._section = obj.section;
        this._installedSize = obj.installedSize;
        this._maintainer = obj.maintainer;
        this._architecture = obj.architecture;
        this._version = obj.version;
        this._description = obj.description;
        this._source = obj.source;
        this._multiArch = obj.multiArch;
        this._essential = obj.essential;
        this._dependingPackageNames = obj.dependingPackageNames;
        this._dependingPackages = obj.dependingPackages;
        this._dependencies = obj.dependencies;
        this._preDependencies = obj.preDependencies;
        this._replaces = obj.replaces;
        this._provides = obj.provides;
        this._dependenciesString = obj.dependenciesString;
        this._preDependenciesString = obj.preDependenciesString;
        this._recommends = obj.recommends;
        this._conflicts = obj.conflicts;
        this._confFiles = obj.confFiles;
        this._suggests = obj.suggests;
        this._breaks = obj.breaks;
        this._originalMaintainer = obj.originalMaintainer;
        this._homePage = obj.homePage;
        this._breaks = obj.breaks;
        this._enhances = obj.enhances;
        this._providesString = obj.providesString;
        this._extraFields = obj.extraFields;
    };

    public get packageName(): string {
        return this._packageName;
    }


    public set packageName(packageName: string) {
        this._packageName = packageName;
    }

    public get dependingPackages(): Package[] {
        return this._dependingPackages;
    }

    public set dependingPackages(dependingPackages: Package[]) {
        this._dependingPackages = dependingPackages;
    }

    public get dependingPackageNames(): string[] {
        return this._dependingPackageNames;
    }

    public set dependingPackageNames(dependingPackageNames: string[]) {
        this._dependingPackageNames = dependingPackageNames;
    }

    public get dependencies(): Dependency[] {
        return this._dependencies;
    }

    public set dependencies(dependencies: Dependency[]) {
        this._dependencies = dependencies;
    }

    public get preDependencies(): Dependency[] {
        return this._preDependencies;
    }

    public set preDependencies(preDependencies: Dependency[]) {
        this._preDependencies = preDependencies;
    }

    public get preDependenciesString(): string | undefined {
        return this._preDependenciesString;
    }

    public set preDependenciesString(preDependenciesString: string | undefined) {
        this._preDependenciesString = preDependenciesString;
    }

    public get dependenciesString(): string | undefined {
        return this._dependenciesString;
    }

    public set dependenciesString(dependenciesString: string | undefined) {
        this._dependenciesString = dependenciesString;
    }

    /* Workaround for JSON serializing, add fields here that you wish to serialize into JSON */
    private getDTO(): Object {
        return {
            packageName: this.packageName,
            source: this._source,
            version: this._version,
            section: this._section,
            priority: this._priority,
            architecture: this._architecture,
            essential: this._essential,
            dependencies: this._dependencies,
            recommends: this._recommends,
            suggests: this._suggests,
            enhances: this._enhances,
            preDependencies: this._preDependencies,
            installedSize: this._installedSize,
            maintainer: this._maintainer,
            homePage: this._homePage,
            description: this._description,
            status: this._status,
            multiArch: this._multiArch,
            dependingPackageNames: this._dependingPackageNames,
            replaces: this._replaces,
            provides: this._provides,
            conflicts: this._conflicts,
            confFiles: this._confFiles,
            breaks: this._breaks,
            originalMaintainer: this._originalMaintainer,
            providesString: this._providesString,
            extraFields: this._extraFields
        };
    };

    toJSON(): Object {
        return this.getDTO();
    };
};


export const isValidPackageConstructor = (obj: any): obj is PackageConstructor => {
    const p: PackageConstructor = obj
    return typeof p.packageName === "string"
        && typeof p.status === "string"
        && typeof p.priority === "string"
        && typeof p.section === "string"
        && typeof p.installedSize === "number"
        && typeof p.maintainer === "string"
        && typeof p.architecture === "string"
        && typeof p.version === "string"
        && typeof p.description === "object";
}