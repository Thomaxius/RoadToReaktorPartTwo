import { AlternativeDependency } from "./alternativeDependency";
import { Package } from "./package";

export class Dependency {
    private _packageName: string;
    public _package?: Package;
    private _isInstalled: boolean;
    private _alternatives: AlternativeDependency[] = [];

    constructor(packageName: string, _package?: Package, alternatives?: AlternativeDependency[]) {
        this._packageName = packageName;
        this._package = _package;
        this._isInstalled = _package ? true : false;
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

    public get isInstalled(): boolean {
        return this._isInstalled;
    }

    public set isInstalled(isInstalled: boolean) {
        this._isInstalled = isInstalled;
    }

    /* Workaround for JSON serializing, add fields here that you wish to serialize into JSON */
    private getDTO(): Object {
        return {
            packageName: this._packageName,
            isInstalled: this._isInstalled,
            alternatives: this._alternatives
        }
    }
    toJSON(): Object {
        return this.getDTO()
    }


}