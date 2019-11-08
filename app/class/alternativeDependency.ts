import { Package } from "./package";

export class AlternativeDependency {
    private _packageName: string;
    public _package?: Package;
    private _isInstalled: boolean;

    constructor(packageName: string, _package?: Package) {
        this._packageName = packageName;
        this._package = _package;
        this._isInstalled = _package ? true : false;
    }

    public set isInstalled(isInstalled: boolean) {
        this._isInstalled = isInstalled
    }

    public get packageName(): string {
        return this._packageName;
    }

    public get isInstalled(): boolean {
        return this._isInstalled;
    }

    /* Workaround for JSON serializing, add fields here that you wish to serialize into JSON */
    private getDTO(): Object {
        return {
            packageName: this.packageName,
            isInstalled: this.isInstalled
        }

    }

    toJSON(): Object {
        return this.getDTO()
    }
}