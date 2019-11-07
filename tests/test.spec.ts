
import { expect } from 'chai';
import 'mocha';
import { PackageParser } from '../app/class/packageParser';
import { Package } from '../app/class/package';
import { Dependency } from '../app/class/dependency';
import { AlternativeDependency } from '../app/class/alternativeDependency';

const emptyArray = (array: any[]) => array.length = 0;

describe('Package parser mock status file tests', () => {

    let packages: Package[] = []

    beforeEach(async () => {
        packages = PackageParser.fromStatusFile("tests/mockStatusFile");
    })

    afterEach(() => {
        emptyArray(packages)
    });

    it('Non existing file should throw error', () => {
        expect(() => {
            PackageParser.fromStatusFile("doesnotexist");
        }).to.throw(`Error: ENOENT: no such file or directory, open 'doesnotexist'`);
    });

    it('Empty file should throw an error', () => {
        expect(() => {
            PackageParser.fromStatusFile("tests/emptyMockFile");
        }).to.throw(`Error: File is empty`);
    });

    it('Length of packages array should equal 6', () => {
        expect(packages.length).to.equal(6);
    });

    it(`Package 'python' should have correct dependencies`, () => {
        const pythonPackage: Package | undefined = packages.find((_package) => _package.packageName === 'python')
        expect(pythonPackage).not.to.be.undefined;
        if (pythonPackage) {
            expect(pythonPackage.dependencies.length).to.equal(2, 'package python did not have two dependencies');
            const pythonTwoPointSevenDependency: Dependency | undefined = pythonPackage.dependencies.find((dependency: Dependency) => dependency.packageName === 'python2.7');
            const pythonMinimalDependency: Dependency | undefined = pythonPackage.dependencies.find((dependency: Dependency) => dependency.packageName === 'python-minimal');
            expect(pythonTwoPointSevenDependency).not.to.be.undefined;
            expect(pythonMinimalDependency).not.to.be.undefined;
        }
    });

    it(`Package 'libgdbm3' should have correct dependencies`, () => {
        const libgdbm3: Package | undefined = packages.find((_package) => _package.packageName === 'libgdbm3')
        expect(libgdbm3).not.to.be.undefined;
        if (libgdbm3) {
            expect(libgdbm3.dependencies.length).to.equal(2, 'package libc6 did not have two dependencies');
            const lib6: Dependency | undefined = libgdbm3.dependencies.find((dependency: Dependency) => dependency.packageName === 'libc6');
            const dpkg: Dependency | undefined = libgdbm3.dependencies.find((dependency: Dependency) => dependency.packageName === 'dpkg');
            expect(lib6).not.to.be.undefined;
            expect(dpkg).not.to.be.undefined;
            if (dpkg) {
                const installInfo: AlternativeDependency | undefined = dpkg.alternatives.find((dependency) => dependency.packageName === 'install-info')
                expect(installInfo).not.to.be.undefined;
                if (installInfo) {
                    expect(installInfo.isInstalled).to.be.true;
                }
            }
        }
    });

    it(`should provide correct JSON`, async () => {
        const json = JSON.stringify(packages);
        const expectedJson = `[{"packageName":"install-info","source":"texinfo","version":"4.13a.dfsg.1-8ubuntu2","section":"doc","priority":"important","architecture":"amd64","dependencies":[{"packageName":"libc6","isInstalled":false,"alternatives":[]}],"preDependencies":[],"installedSize":218,"maintainer":"Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>","description":{"synopsis":"Manage installed documentation in info format","longDescription":"The install-info utility creates the index of all installed documentation\\n in info format and makes it available to info readers."},"status":"install ok installed","multiArch":"foreign","dependingPackageNames":["libgdbm3"],"replaces":"texinfo (<< 4.13a.dfsg.1-2)","breaks":"texinfo (<< 4.13a.dfsg.1-2)","originalMaintainer":"Debian TeX maintainers <debian-tex-maint@lists.debian.org>","extraFields":[]},{"packageName":"libbsf-java","version":"1:2.4.0-5","section":"java","priority":"optional","architecture":"all","dependencies":[{"packageName":"libapache-pom-java","isInstalled":false,"alternatives":[]}],"suggests":"bsh, libxalan2-java, rhino","preDependencies":[],"installedSize":130,"maintainer":"Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>","homePage":"http://jakarta.apache.org/bsf/","description":{"synopsis":"Bean Scripting Framework to support scripting languages in Java","longDescription":"Bean Scripting Framework (BSF) is a set of Java classes which provides\\n scripting language support within Java applications, and access to Java\\n objects and methods from scripting languages. BSF allows one to write JSPs in\\n languages other than Java while providing access to the Java class library. In\\n addition, BSF permits any Java application to be implemented in part (or\\n dynamically extended) by a language that is embedded within it. This is\\n achieved by providing an API that permits calling scripting language engines\\n from within Java, as well as an object registry that exposes Java objects to\\n these scripting language engines.\\n .\\n BSF supports these scripting languages:\\n  * Python (using Jython)\\n  * JavaScript (using rhino)\\n  * XSLT Stylesheets (as a component of Apache XML project's Xalan and Xerces)\\n  * BeanShell (using bsh) via its own bsf adapter\\n .\\n Support for Tcl, NetRexx is not available in this Debian\\n package since Jacl, NetRexx (non-free) are not packaged."},"status":"install ok installed","dependingPackageNames":[],"originalMaintainer":"Debian Java Maintainers <pkg-java-maintainers@lists.alioth.debian.org>","extraFields":[]},{"packageName":"libgdbm3","source":"gdbm","version":"1.8.3-10","section":"libs","priority":"important","architecture":"amd64","dependencies":[{"packageName":"libc6","isInstalled":false,"alternatives":[]},{"packageName":"dpkg","isInstalled":false,"alternatives":[{"packageName":"install-info","isInstalled":true}]}],"preDependencies":[{"packageName":"multiarch-support","isInstalled":false,"alternatives":[]}],"installedSize":132,"maintainer":"Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>","homePage":"http://directory.fsf.org/project/gdbm/","description":{"synopsis":"GNU dbm database routines (runtime version)","longDescription":"GNU dbm ('gdbm') is a library of database functions that use extendible\\n hashing and works similarly to the standard UNIX 'dbm' functions.\\n .\\n The basic use of 'gdbm' is to store key/data pairs in a data file, thus\\n providing a persistent version of the 'dictionary' Abstract Data Type\\n ('hash' to perl programmers)."},"status":"install ok installed","multiArch":"same","dependingPackageNames":[],"originalMaintainer":"Anibal Monsalve Salazar <anibal@debian.org>","extraFields":[]},{"packageName":"python","source":"python-defaults","version":"2.7.3-0ubuntu2","section":"python","priority":"important","architecture":"amd64","dependencies":[{"packageName":"python2.7","isInstalled":false,"alternatives":[]},{"packageName":"python-minimal","isInstalled":false,"alternatives":[]}],"suggests":"python-doc (= 2.7.3-0ubuntu2), python-tk (= 2.7.3-0ubuntu2)","preDependencies":[],"installedSize":658,"maintainer":"Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>","homePage":"http://www.python.org/","description":{"synopsis":"interactive high-level object-oriented language (default version)","longDescription":"Python, the high-level, interactive object oriented language,\\n includes an extensive class library with lots of goodies for\\n network programming, system administration, sounds and graphics.\\n .\\n This package is a dependency package, which depends on Debian's default\\n Python version (currently v2.7)."},"status":"install ok installed","dependingPackageNames":["python-pkg-resources"],"replaces":"python-dev (<< 2.6.5-2)","provides":"python-ctypes, python-email, python-importlib, python-profiler, python-wsgiref","conflicts":"python-central (<< 0.5.5)","breaks":"python-bz2 (<< 1.1-8), python-csv (<< 1.0-4), python-email (<< 2.5.5-3), update-manager-core (<< 0.200.5-2)","originalMaintainer":"Matthias Klose <doko@debian.org>","extraFields":[]},{"packageName":"python-pkg-resources","source":"distribute","version":"0.6.24-1ubuntu1","section":"python","priority":"optional","architecture":"all","dependencies":[{"packageName":"python","isInstalled":true,"alternatives":[]}],"suggests":"python-distribute, python-distribute-doc","preDependencies":[],"installedSize":175,"maintainer":"Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>","homePage":"http://packages.python.org/distribute","description":{"synopsis":"Package Discovery and Resource Access using pkg_resources","longDescription":"The pkg_resources module provides an API for Python libraries to\\n access their resource files, and for extensible applications and\\n frameworks to automatically discover plugins.  It also provides\\n runtime support for using C extensions that are inside zipfile-format\\n eggs, support for merging packages that have separately-distributed\\n modules or subpackages, and APIs for managing Python's current\\n \\"working set\\" of active packages."},"status":"install ok installed","dependingPackageNames":[],"replaces":"python2.3-setuptools, python2.4-setuptools","provides":"python2.6-setuptools, python2.7-setuptools","conflicts":"python-setuptools (<< 0.6c8-3), python2.3-setuptools (<< 0.6b2), python2.4-setuptools (<< 0.6b2)","originalMaintainer":"Matthias Klose <doko@debian.org>","extraFields":[{"fieldName":"Python-Version","value":"2.6, 2.7"}]},{"packageName":"tcpd","source":"tcp-wrappers","version":"7.6.q-21","section":"net","priority":"optional","architecture":"amd64","dependencies":[{"packageName":"libc6","isInstalled":false,"alternatives":[]},{"packageName":"libwrap0","isInstalled":false,"alternatives":[]}],"preDependencies":[],"installedSize":132,"maintainer":"Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>","description":{"synopsis":"Wietse Venema's TCP wrapper utilities","longDescription":"Wietse Venema's network logger, also known as TCPD or LOG_TCP.\\n .\\n These programs log the client host name of incoming telnet,\\n ftp, rsh, rlogin, finger etc. requests.\\n .\\n Security options are:\\n  - access control per host, domain and/or service;\\n  - detection of host name spoofing or host address spoofing;\\n  - booby traps to implement an early-warning system."},"status":"install ok installed","multiArch":"foreign","dependingPackageNames":[],"replaces":"libwrap0 (<< 7.6-8)","originalMaintainer":"Marco d'Itri <md@linux.it>","extraFields":[]}]`
        expect(json).to.equal(expectedJson);
    });


});