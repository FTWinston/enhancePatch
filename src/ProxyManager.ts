import { isArray, isMap, isSet } from 'enhancejson';
import { ArrayOperation, ArrayOperationType } from './ArrayOperation';
import { ArrayPatch, MapPatch, ObjectPatch, Patch, SetPatch } from './Patch';
import { ConditionalFilter, Filter, FilterKey, unfilteredFilter } from './Filter';

type FilterIdentifer = string | number | null;

interface ProxyInfo {
    filters: Map<FilterIdentifer, ConditionalFilter>;
    patches: Map<FilterIdentifer, Patch>;
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
    patches: Map<FilterIdentifer, T>;
}

interface ArrayPatchProxyInfo extends PatchProxyInfo<ArrayPatch> {
    uncreatedChildPatchIndexes: Map<Patch, number>;
}

export class ProxyManager<TRoot extends object> {
    private readonly proxies = new WeakMap<object, ProxyInfo>();

    private readonly rootInfo: TypedProxyInfo<TRoot>;

    public get rootProxy() {
        return this.rootInfo.proxy;
    }

    constructor(tree: TRoot, filters: Map<FilterIdentifer, Filter>) {
        const rootFilters = new Map<FilterIdentifer, ConditionalFilter>();
        for (const [identifier, filter] of filters) {
            rootFilters.set(identifier, { include: true, filter });
        }

        this.rootInfo = this.createProxy(tree, rootFilters, undefined, () => {});
    }

    public getPatches(): Map<FilterIdentifer, Patch> {
        // If addToOutput is still set, nothing has yet been added to the output. So there's no patches.
        // return this.rootInfo.addToOutput ? null : this.rootInfo.patch; 
        // TODO: recreate above logic?

        return this.rootInfo.patches;
    }

    private getFilterField(filter: Filter, field: FilterKey): ConditionalFilter | undefined {
        let specificFilter = filter.fixedKeys?.get(field);

        return specificFilter === undefined
            ? filter.otherKeys
            : specificFilter;
    }

    private shouldIncludeChild(conditionalFilter: ConditionalFilter | undefined, field: FilterKey): boolean {
        if (conditionalFilter === undefined) {
            return false;
        }

        return typeof conditionalFilter.include === 'boolean'
            ? conditionalFilter.include
            : conditionalFilter.include(field);
    }

    private getChildFilters(filters: Map<FilterIdentifer, ConditionalFilter>, field: FilterKey): Map<FilterIdentifer, ConditionalFilter> {
        const results = new Map<FilterIdentifer, ConditionalFilter>();

        for (const [identifier, conditionalFilter] of filters) {
            const fieldFilter = conditionalFilter.filter
                ? this.getFilterField(conditionalFilter.filter, field)
                : unfilteredFilter;

            if (fieldFilter && fieldFilter.include !== false) {
                results.set(identifier, fieldFilter);
            }
        }

        return results;
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
                            for (const [filterIdentifier, patch] of info.patches) {
                                if (patch.c === undefined) {
                                    patch.c = {};
                                }
                                patch.c[field] = childInfo.patches.get(filterIdentifier)!;    
                            }
                            
                            if (info.addToOutput) {
                                info.addToOutput();
                                delete info.addToOutput;
                            }
                        };

                        const childInfo = this.createProxy(
                            val,
                            this.getChildFilters(info.filters, field),
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
                    for (const patch of info.patches.values()) {
                        if (patch.s === undefined) {
                            patch.s = {};
                        }
                        patch.s[field] = val;

                        if (patch.d !== undefined) {
                            const removeAt = patch.d.indexOf(field);
                            if (removeAt !== -1) {
                                patch.d.splice(removeAt, 1);
                            }
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
                    for (const patch of info.patches.values()) {
                        if (patch.d === undefined) {
                            patch.d = [];
                        }
                        patch.d.push(field);

                        if (patch.s !== undefined) {
                            delete patch.s[field];
                        }
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
        for (const patch of info.patches.values()) {
            if (patch.o === undefined) {
                patch.o = [];
            }

            patch.o.push(op);
        }

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

        for (const patch of info.patches.values()) {
            const children = patch.c;

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

            patch.c = newChildren;
        }
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

                        const shift = items.length - deleteCount;

                        // Update child patch indexes
                        this.adjustArrayChildIndexes(info, (i) =>
                            i < start ? i : i + shift
                        );

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
                            for (const patch of info.patches.values()) {
                                if (patch.c === undefined) {
                                    patch.c = {};
                                }
                            }

                            const index =
                                info.uncreatedChildPatchIndexes.get(val);
                            if (index !== undefined) {
                                for (const [filterIdentifier, patch] of info.patches) {
                                    patch.c![index] = childInfo.patches.get(filterIdentifier)!;
                                }

                                if (info.addToOutput) {
                                    info.addToOutput();
                                    delete info.addToOutput;
                                }
                            }
                        };

                        const childInfo = this.createProxy(
                            val,
                            this.getChildFilters(info.filters, field),
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
                                            for (const patch of info.patches.values()) {
                                                if (patch.c === undefined) {
                                                    patch.c = {};
                                                }
                                                patch.c[key] =
                                                    childInfo.patches.get(null)!;
                                            }
                                            if (info.addToOutput) {
                                                info.addToOutput();
                                                delete info.addToOutput;
                                            }
                                        }
                                        : () => {
                                            for (const patch of info.patches.values()) {
                                                if (patch.C === undefined) {
                                                    patch.C = {};
                                                }
                                                patch.C[key] =
                                                  childInfo.patches.get(null)!;
                                            }
                                            if (info.addToOutput) {
                                                info.addToOutput();
                                                delete info.addToOutput;
                                            }
                                        };

                                const childInfo = this.createProxy(
                                    val,
                                    this.getChildFilters(info.filters, field),
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
                            for (const patch of info.patches.values()) {
                                if (patch.s === undefined) {
                                    patch.s = [];
                                }
                                patch.s.push([key, val]);

                                if (isArray(patch.d)) {
                                    const removeAt = patch.d.indexOf(key);
                                    if (removeAt !== -1) {
                                        patch.d.splice(removeAt, 1);
                                    }
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
                            for (const patch of info.patches.values()) {
                                if (patch.d !== true) {
                                    if (patch.d === undefined) {
                                        patch.d = [];
                                    }
                                    patch.d.push(key);
                                }

                                if (patch.s !== undefined) {
                                    const removeAt = patch.s.findIndex(
                                        (el) => el[0] === key
                                    );
                                    if (removeAt !== -1) {
                                        patch.s.splice(removeAt, 1);
                                    }
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
                        for (const patch of info.patches.values()) {
                            patch.d = true;
                            delete patch.s;
                        }

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
                            for (const patch of info.patches.values()) {
                                if (patch.a === undefined) {
                                    patch.a = [];
                                }
                                patch.a.push(val);

                                if (isArray(patch.d)) {
                                    const removeAt = patch.d.indexOf(val);
                                    if (removeAt !== -1) {
                                        patch.d.splice(removeAt, 1);
                                    }
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
                            for (const patch of info.patches.values()) {
                                if (patch.d !== true) {
                                    if (patch.d === undefined) {
                                        patch.d = [];
                                    }
                                    patch.d.push(val);
                                }

                                if (patch.a !== undefined) {
                                    const removeAt = patch.a.indexOf(val);
                                    if (removeAt !== -1) {
                                        patch.a.splice(removeAt, 1);
                                    }
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

                        for (const patch of info.patches.values()) {
                            patch.d = true;
                            delete patch.a;
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

    private createProxy<T extends object>(
        underlying: T,
        filters: Map<FilterIdentifer, ConditionalFilter>,
        parent?: ProxyInfo,
        addToOutput?: () => void
    ): TypedProxyInfo<T> {
        const info: TypedProxyInfo<T> = {
            parent,
            addToOutput,
            filters,
            patches: new Map(),
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
