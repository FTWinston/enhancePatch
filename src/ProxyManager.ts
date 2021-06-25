import { isArray, isMap, isSet } from 'enhancejson/lib/typeChecks';
import { ArrayPatch, MapPatch, ObjectPatch, Patch, SetPatch } from './Patch';

interface ProxyInfo {
    patch: Patch;
    parent?: ProxyInfo;
    addToOutput?: () => void;
    proxy: object;
    underlying: object;
    proxiedChildren: Set<object>;
}

interface TypedProxyInfo<T extends object> extends ProxyInfo {
    proxy: T;
    underlying: T;
}

interface PatchProxyInfo<T extends Patch> extends ProxyInfo {
    patch: T;
}

interface IProxyManager {
    readonly rootPatch: Patch | null;
}

export const managersByProxy = new WeakMap<object, IProxyManager>();

export class ProxyManager<TRoot extends object> implements IProxyManager {
    private readonly proxies = new WeakMap<object, ProxyInfo>();

    private readonly rootInfo: TypedProxyInfo<TRoot>;

    public get rootProxy() {
        return this.rootInfo.proxy;
    }

    // If addToOutput is still set, nothing has yet been added to the output. So there's no patch.
    public get rootPatch() {
        return this.rootInfo.addToOutput ? null : this.rootInfo.patch;
    }

    constructor(tree: TRoot) {
        this.rootInfo = this.createProxy(tree, undefined, () => {});
    }

    private createObjectHandler(
        info: PatchProxyInfo<ObjectPatch>
    ): ProxyHandler<object> {
        return {
            get: (target, field) => {
                let val = (target as any)[field];

                if (typeof field === 'string' && field !== 'prototype') {
                    const existingChildInfo = this.proxies.get(val);

                    if (existingChildInfo) {
                        return existingChildInfo.proxy;
                    }

                    if (this.canProxy(val)) {
                        info.proxiedChildren.add(val);

                        const addChildToOutput = () => {
                            if (info.patch.c === undefined) {
                                info.patch.c = {};
                            }
                            info.patch.c[field] = childInfo.patch;

                            if (info.addToOutput) {
                                info.addToOutput();
                                delete info.addToOutput;
                            }
                        };

                        const childInfo = this.createProxy(
                            val,
                            info,
                            addChildToOutput
                        );

                        return childInfo.proxy;
                    }
                }

                return val;
            },
            set: (target, field, val) => {
                const prevVal = (target as any)[field];

                (target as any)[field] = val;

                if (typeof field === 'string') {
                    if (info.patch.s === undefined) {
                        info.patch.s = {};
                    }
                    info.patch.s[field] = val;

                    if (info.patch.d !== undefined) {
                        const removeAt = info.patch.d.indexOf(field);
                        if (removeAt !== -1) {
                            info.patch.d.splice(removeAt, 1);
                        }
                    }

                    info.proxiedChildren.delete(prevVal);
                    this.removeProxy(prevVal);

                    if (info.addToOutput) {
                        info.addToOutput();
                        delete info.addToOutput;
                    }
                }

                return true;
            },
            deleteProperty: (target, field) => {
                const val = (target as any)[field];

                delete (target as any)[field];

                if (typeof field === 'string') {
                    if (info.patch.d === undefined) {
                        info.patch.d = [];
                    }
                    info.patch.d.push(field);

                    if (info.patch.s !== undefined) {
                        delete info.patch.s[field];
                    }

                    info.proxiedChildren.delete(val);
                    this.removeProxy(val);

                    if (info.addToOutput) {
                        info.addToOutput();
                        delete info.addToOutput;
                    }
                }

                return true;
            },
        };
    }

    private createArrayHandler(
        info: PatchProxyInfo<ArrayPatch>
    ): ProxyHandler<any[]> {
        return {
            /*
            get: (target, field) => {
                let val = (target as any)[field];

                if (field === 'splice') {
                    return (
                        start: number,
                        deleteCount: number,
                        ...items: any[]
                    ) => {
                        for (let i = start; i < start + deleteCount; i++) {
                            const removing = target[i];
                            proxiedChildren.delete(removing);
                            this.removeProxy(removing);
                        }

                        this.patchCallback(
                            this.createSpliceOperation(
                                path,
                                start,
                                deleteCount,
                                items
                            )
                        );

                        return target.splice(start, deleteCount, ...items);
                    };
                } else if (field === 'shift') {
                    return () => {
                        this.patchCallback(this.createShiftOperation(path));

                        const shifted = target.shift();

                        proxiedChildren.delete(shifted);
                        this.removeProxy(shifted);

                        return shifted;
                    };
                } else if (field === 'unshift') {
                    return (...items: any[]) => {
                        this.patchCallback(
                            this.createUnshiftOperation(path, items)
                        );

                        return target.unshift(...items);
                    };
                } else if (field === 'reverse') {
                    return () => {
                        this.patchCallback(this.createReverseOperation(path));

                        return target.reverse();
                    };
                }

                if (typeof field === 'string' && field !== 'prototype') {
                    val = this.getField(path, field, val, proxiedChildren);
                }

                return val;
            },
            set: (target, field, val) => {
                const prevVal = (target as any)[field];

                (target as any)[field] = val;

                // Don't record array length changes.
                if (typeof field === 'string' && field !== 'length') {
                    this.setField(path, field, val, prevVal, proxiedChildren);
                }

                return true;
            },
            deleteProperty: (target, field) => {
                const val = (target as any)[field];

                delete (target as any)[field];

                if (typeof field === 'string') {
                    this.deleteField(path, field, val, proxiedChildren);
                }

                return true;
            },
            */
        };
    }

    private isAllowedMapKey(key: any): key is string | number {
        switch (typeof key) {
            case 'string':
            case 'number':
                return true;
            default:
                return false;
        }
    }

    private createMapHandler(
        info: PatchProxyInfo<MapPatch>
    ): ProxyHandler<Map<any, any>> {
        return {
            get: (target, field) => {
                let func;

                if (field === 'get') {
                    func = (key: any) => {
                        let val = target.get(key);

                        if (this.isAllowedMapKey(key)) {
                            const existingChildInfo = this.proxies.get(val);

                            if (existingChildInfo) {
                                return existingChildInfo.proxy;
                            }

                            if (this.canProxy(val)) {
                                info.proxiedChildren.add(val);

                                const addChildToOutput =
                                    typeof key === 'string'
                                        ? () => {
                                              if (info.patch.c === undefined) {
                                                  info.patch.c = {};
                                              }
                                              info.patch.c[key] =
                                                  childInfo.patch;

                                              if (info.addToOutput) {
                                                  info.addToOutput();
                                                  delete info.addToOutput;
                                              }
                                          }
                                        : () => {
                                              if (info.patch.C === undefined) {
                                                  info.patch.C = {};
                                              }
                                              info.patch.C[key] =
                                                  childInfo.patch;

                                              if (info.addToOutput) {
                                                  info.addToOutput();
                                                  delete info.addToOutput;
                                              }
                                          };

                                const childInfo = this.createProxy(
                                    val,
                                    info,
                                    addChildToOutput
                                );

                                return childInfo.proxy;
                            }
                        }

                        return val;
                    };
                } else if (field === 'set') {
                    func = (key: any, val: any) => {
                        const prevVal = target.get(key);

                        target.set(key, val);

                        if (this.isAllowedMapKey(key)) {
                            if (info.patch.s === undefined) {
                                info.patch.s = [];
                            }
                            info.patch.s.push([key, val]);

                            if (isArray(info.patch.d)) {
                                const removeAt = info.patch.d.indexOf(key);
                                if (removeAt !== -1) {
                                    info.patch.d.splice(removeAt, 1);
                                }
                            }

                            info.proxiedChildren.delete(prevVal);
                            this.removeProxy(prevVal);

                            if (info.addToOutput) {
                                info.addToOutput();
                                delete info.addToOutput;
                            }
                        }

                        return this;
                    };
                } else if (field === 'delete') {
                    func = (key: any) => {
                        const val = target.get(key);

                        target.delete(key);

                        if (this.isAllowedMapKey(key)) {
                            if (info.patch.d !== true) {
                                if (info.patch.d === undefined) {
                                    info.patch.d = [];
                                }
                                info.patch.d.push(key);
                            }

                            if (info.patch.s !== undefined) {
                                const removeAt = info.patch.s.findIndex(
                                    (el) => el[0] === key
                                );
                                if (removeAt !== -1) {
                                    info.patch.s.splice(removeAt, 1);
                                }
                            }

                            info.proxiedChildren.delete(val);
                            this.removeProxy(val);

                            if (info.addToOutput) {
                                info.addToOutput();
                                delete info.addToOutput;
                            }
                        }

                        return this;
                    };
                } else if (field === 'clear') {
                    func = () => {
                        target.clear();
                        info.patch.d = true;
                        delete info.patch.s;

                        for (const child of info.proxiedChildren) {
                            this.removeProxy(child);
                        }
                        info.proxiedChildren.clear();

                        if (info.addToOutput) {
                            info.addToOutput();
                            delete info.addToOutput;
                        }
                    };
                } else {
                    let val = (target as any)[field];

                    if (typeof val === 'function') {
                        val = val.bind(target);
                    }

                    return val;
                }

                return func.bind(target);
            },
        };
    }

    private createSetHandler(
        info: PatchProxyInfo<SetPatch>
    ): ProxyHandler<Set<any>> {
        // For patch purposes treat Sets like Maps, use the values as keys and always use "1" as the pretend value.
        return {
            get: (target, field) => {
                let func;

                if (field === 'add') {
                    func = (val: any) => {
                        target.add(val);

                        if (this.isAllowedMapKey(val)) {
                            if (info.patch.a === undefined) {
                                info.patch.a = [];
                            }
                            info.patch.a.push(val);

                            if (isArray(info.patch.d)) {
                                const removeAt = info.patch.d.indexOf(val);
                                if (removeAt !== -1) {
                                    info.patch.d.splice(removeAt, 1);
                                }
                            }

                            if (info.addToOutput) {
                                info.addToOutput();
                                delete info.addToOutput;
                            }
                        }

                        return this;
                    };
                } else if (field === 'delete') {
                    func = (val: any) => {
                        target.delete(val);

                        if (this.isAllowedMapKey(val)) {
                            if (info.patch.d !== true) {
                                if (info.patch.d === undefined) {
                                    info.patch.d = [];
                                }
                                info.patch.d.push(val);
                            }

                            if (info.patch.a !== undefined) {
                                const removeAt = info.patch.a.indexOf(val);
                                if (removeAt !== -1) {
                                    info.patch.a.splice(removeAt, 1);
                                }
                            }

                            if (info.addToOutput) {
                                info.addToOutput();
                                delete info.addToOutput;
                            }
                        }

                        return this;
                    };
                } else if (field === 'clear') {
                    func = () => {
                        target.clear();

                        info.patch.d = true;
                        delete info.patch.a;

                        if (info.addToOutput) {
                            info.addToOutput();
                            delete info.addToOutput;
                        }
                    };
                } else {
                    let val = (target as any)[field];

                    if (typeof val === 'function') {
                        val = val.bind(target);
                    }

                    return val;
                }

                return func.bind(target);
            },
        };
    }

    public createProxy<T extends object>(
        underlying: T,
        parent?: ProxyInfo,
        addToOutput?: () => void
    ): TypedProxyInfo<T> {
        const info: TypedProxyInfo<T> = {
            parent,
            addToOutput,
            patch: {},
            proxy: new Proxy(underlying, {}), // TODO: avoid this needless instantiation?
            proxiedChildren: new Set<object>(),
            underlying,
        };

        let handler: ProxyHandler<any>;

        if (isArray(underlying)) {
            handler = this.createArrayHandler(
                info as PatchProxyInfo<ArrayPatch>
            );
        } else if (isMap(underlying)) {
            handler = this.createMapHandler(info as PatchProxyInfo<MapPatch>);
        } else if (isSet(underlying)) {
            handler = this.createSetHandler(info as PatchProxyInfo<SetPatch>);
        } else {
            handler = this.createObjectHandler(
                info as PatchProxyInfo<ObjectPatch>
            );
        }

        info.proxy = new Proxy(underlying, handler);
        this.proxies.set(underlying, info);

        return info;
    }

    private canProxy(object: any) {
        if (this.proxies.has(object)) {
            return false;
        }

        return (
            !!object && typeof object === 'object' && !(object instanceof Date)
        );
    }

    private removeProxy(object: object) {
        const proxyInfo = this.proxies.get(object);

        if (!proxyInfo) {
            return;
        }

        this.proxies.delete(object);

        // Recursively delete any child proxies still being held onto.
        for (const childObject of proxyInfo.proxiedChildren) {
            this.removeProxy(childObject);
        }
    }

    /*
    private createSetOperation(path: Path, field: string, val: any): Operation {
        return {
            p: path,
            o: OperationType.Set,
            v: [[field, val]],
        };
    }

    private createDeleteOperation(path: Path, field: string): Operation {
        return {
            p: path,
            o: OperationType.Delete,
            k: [field],
        };
    }

    private createClearOperation(path: Path): Operation {
        return {
            p: path,
            o: OperationType.Clear,
        };
    }

    private createSpliceOperation(
        path: Path,
        start: number,
        deleteCount: number,
        items: any[]
    ): Operation {
        return {
            p: path,
            o: OperationType.ArraySplice,
            v: [start, deleteCount, items],
        };
    }

    private createShiftOperation(path: Path): Operation {
        return {
            p: path,
            o: OperationType.ArrayShift,
        };
    }

    private createUnshiftOperation(path: Path, items: any[]): Operation {
        return {
            p: path,
            o: OperationType.ArrayUnshift,
            v: items,
        };
    }

    private createReverseOperation(path: Path): Operation {
        return {
            p: path,
            o: OperationType.ArrayReverse,
        };
    }
    */
}
