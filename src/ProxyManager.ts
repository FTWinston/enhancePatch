import { isArray, isMap, isSet } from 'enhancejson';
import { ArrayOperation, ArrayOperationType } from './ArrayOperation';
import { ArrayPatch, MapPatch, ObjectPatch, Patch, SetPatch } from './Patch';
import { Filter } from './Filter';

interface ProxyInfo {
    patch: Patch;
    parent?: ProxyInfo;
    addToOutput?: () => void;
    proxy: object;
    underlying: object;
    newlyAddedChildren: Set<object>;
}

interface TypedProxyInfo<T extends object> extends ProxyInfo {
    proxy: T;
    underlying: T;
}

interface PatchProxyInfo<T extends Patch> extends ProxyInfo {
    patch: T;
}

interface ArrayPatchProxyInfo extends PatchProxyInfo<ArrayPatch> {
    uncreatedChildPatchIndexes: Map<Patch, number>;
}

export type FilterKey = string | number;

export class ProxyManager<TRoot extends object> {
    private readonly proxies = new WeakMap<object, ProxyInfo>();

    private readonly rootInfo: TypedProxyInfo<TRoot>;

    private readonly filters: Map<FilterKey | null, Filter>;

    public get rootProxy() {
        return this.rootInfo.proxy;
    }

    /*
    // If addToOutput is still set, nothing has yet been added to the output. So there's no patch.
    public get rootPatch() {
        return this.rootInfo.addToOutput ? null : this.rootInfo.patch;
    }
    */

    constructor(tree: TRoot, filters: Map<FilterKey | null, Filter>) {
        this.filters = filters;
        this.rootInfo = this.createProxy(tree, undefined, () => {});
    }

    public getPatches(): Map<FilterKey | null, Patch> {
        // TODO: implement this ... we had to have done something with filters in the constructor, to be able to produce output here.
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

                    if (this.canProxy(info, val)) {
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

                    info.newlyAddedChildren.add(val);
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

    private addArrayOp(info: PatchProxyInfo<ArrayPatch>, op: ArrayOperation) {
        if (info.patch.o === undefined) {
            info.patch.o = [];
        }

        info.patch.o.push(op);

        if (info.addToOutput) {
            info.addToOutput();
            delete info.addToOutput;
        }
    }

    private adjustArrayChildIndexes(
        info: ArrayPatchProxyInfo,
        getNewIndex: (index: number) => number | null
    ) {
        for (const [child, index] of info.uncreatedChildPatchIndexes) {
            const newIndex = getNewIndex(index);

            if (newIndex !== null) {
                info.uncreatedChildPatchIndexes.set(child, newIndex);
            }

            info.uncreatedChildPatchIndexes.delete(child);
        }

        const children = info.patch.c;

        if (children === undefined) {
            return;
        }

        const newChildren: Record<number, Patch> = {};

        for (const [strIndex, value] of Object.entries(children)) {
            const index = parseInt(strIndex);
            const newIndex = getNewIndex(index);

            if (newIndex !== null) {
                newChildren[newIndex] = value;
            }
        }

        info.patch.c = newChildren;
    }

    private createArrayHandler(info: ArrayPatchProxyInfo): ProxyHandler<any[]> {
        return {
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
                            this.removeProxy(removing);
                        }

                        if (info.patch.c) {
                            const shift = items.length - deleteCount;

                            // Update child patch indexes
                            this.adjustArrayChildIndexes(info, (i) =>
                                i < start ? i : i + shift
                            );
                        }

                        this.addArrayOp(info, {
                            o: ArrayOperationType.Splice,
                            i: start,
                            d: deleteCount,
                            n: items,
                        });

                        return target.splice(start, deleteCount, ...items);
                    };
                } else if (field === 'shift') {
                    return () => {
                        this.addArrayOp(info, {
                            o: ArrayOperationType.Shift,
                        });

                        // Decrease all child indexes by 1
                        this.adjustArrayChildIndexes(info, (i) =>
                            i > 0 ? i - 1 : null
                        );

                        const shifted = target.shift();

                        this.removeProxy(shifted);

                        return shifted;
                    };
                } else if (field === 'unshift') {
                    return (...items: any[]) => {
                        this.addArrayOp(info, {
                            o: ArrayOperationType.Unshift,
                            n: items,
                        });

                        // update child patch indices... increase them all by items.length
                        this.adjustArrayChildIndexes(
                            info,
                            (i) => i + items.length
                        );

                        return target.unshift(...items);
                    };
                } else if (field === 'reverse') {
                    return () => {
                        this.addArrayOp(info, {
                            o: ArrayOperationType.Reverse,
                        });

                        // update child patch indexes ... reverse them all
                        const length = (info.underlying as any[]).length;
                        this.adjustArrayChildIndexes(
                            info,
                            (i) => length - i - 1
                        );

                        return target.reverse();
                    };
                } else if (
                    typeof val !== 'function' &&
                    typeof field === 'string' &&
                    field !== 'prototype'
                ) {
                    const existingChildInfo = this.proxies.get(val);

                    if (existingChildInfo) {
                        return existingChildInfo.proxy;
                    }

                    if (this.canProxy(info, val)) {
                        // Save this index where it can be modified if the array is altered.
                        info.uncreatedChildPatchIndexes.set(
                            val,
                            parseInt(field)
                        );

                        const addChildToOutput = () => {
                            if (info.patch.c === undefined) {
                                info.patch.c = {};
                            }

                            const index =
                                info.uncreatedChildPatchIndexes.get(val);
                            if (index !== undefined) {
                                info.patch.c[index] = childInfo.patch;

                                if (info.addToOutput) {
                                    info.addToOutput();
                                    delete info.addToOutput;
                                }
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

                // Don't record array length changes.
                if (typeof field === 'string' && field !== 'length') {
                    const index = parseInt(field);

                    if (!isNaN(index)) {
                        this.addArrayOp(info, {
                            o: ArrayOperationType.Set,
                            i: index,
                            v: val,
                        });

                        info.newlyAddedChildren.add(val);
                        this.removeProxy(prevVal);
                    }
                }

                return true;
            },
            deleteProperty: (target, field) => {
                const val = (target as any)[field];

                delete (target as any)[field];

                if (typeof field === 'string') {
                    const index = parseFloat(field);
                    if (!isNaN(index)) {
                        this.addArrayOp(info, {
                            o: ArrayOperationType.Delete,
                            i: index,
                        });

                        this.removeProxy(val);
                    }
                }

                return true;
            },
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

                            if (this.canProxy(info, val)) {
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

                            info.newlyAddedChildren.add(val);
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

                        for (const child of info.underlying as Map<any, any>) {
                            this.removeProxy(child);
                        }

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

    private createProxy<T extends object>(
        underlying: T,
        parent?: ProxyInfo,
        addToOutput?: () => void
    ): TypedProxyInfo<T> {
        const info: TypedProxyInfo<T> = {
            parent,
            addToOutput,
            patch: {},
            proxy: new Proxy(underlying, {}), // TODO: avoid this needless instantiation?
            newlyAddedChildren: new Set<object>(),
            underlying,
        };

        let handler: ProxyHandler<any>;

        if (isArray(underlying)) {
            const arrayInfo = info as unknown as ArrayPatchProxyInfo;
            arrayInfo.uncreatedChildPatchIndexes = new Map();
            handler = this.createArrayHandler(arrayInfo);
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

    private canProxy(parentInfo: ProxyInfo, object: any) {
        if (this.proxies.has(object)) {
            return false;
        }

        if (parentInfo.newlyAddedChildren.has(object)) {
            return false;
        }

        return (
            !!object && typeof object === 'object' && !(object instanceof Date)
        );
    }

    private removeProxy(object: object) {
        this.proxies.delete(object);
    }
}
