import { AlternativeDependency } from "./alternativeDependency";
import { Package } from "./package";

export class Dependency {
    private _packageName: string;
    private _package?: Package;
    private isInstalled: boolean;
    private _alternatives: AlternativeDependency[] = [];

    constructor(packageName: string, _package?: Package, alternatives?: AlternativeDependency[]) {
        this._packageName = packageName;
        this._package = _package;
        this.isInstalled = _package ? true : false;
        this._alternatives = alternatives ? alternatives : [];
    }

    public get packageName(): string {
        return this._packageName;
    }

    public get alternatives(): AlternativeDependency[] {
        return this._alternatives;
    }
    public addAlternatives(_alternativeDependency: AlternativeDependency) {
        this._alternatives.push(_alternativeDependency)
    }

    /* Workaround for JSON serializing, add fields here that you wish to serialize into JSON */
    private getDTO(): Object {
        return {
            packageName: this._packageName,
            isInstalled: this.isInstalled,
            alternatives: this._alternatives
        }
    }
    toJSON(): Object {
        return this.getDTO()
    }


}