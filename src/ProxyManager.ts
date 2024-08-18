import { ArrayOperation, ArrayOperationType } from './ArrayOperation';
import { ConditionalFilter, Filter, FilterKey } from './Filter';
import {
    getArrayChildIndexAdjustment,
    updateArrayPatchChildIndexes,
} from './arrayUtils';
import { ArrayPatch, MapPatch, ObjectPatch, Patch, SetPatch } from './Patch';
import { isArray, isMap, isSet } from './typeChecks';

export type FilterIdentifer = string | number | null;

interface ProxyInfo {
    filters: Map<FilterIdentifer, ConditionalFilter | boolean>;
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
            rootFilters.set(identifier, { ...filter });
        }

        this.rootInfo = this.createProxy(
            tree,
            rootFilters,
            undefined,
            () => {},
        );
    }

    public updateConditionalIncludes() {
        throw new Error('TODO: implement this');
    }

    private alreadyGotPatch = false;

    public getPatches(): Map<FilterIdentifer, Patch> {
        if (this.alreadyGotPatch) {
            throw new Error('Cannot retrieve patches multiple times');
        }

        this.alreadyGotPatch = true;

        return this.rootInfo.patches;
    }

    private getFilterField(
        filter: Filter | boolean,
        field: FilterKey,
    ): ConditionalFilter | undefined {
        let keyFilter: boolean | ConditionalFilter | undefined;

        if (filter === true || filter === false) {
            keyFilter = filter;
        } else if ('keys' in filter) {
            const specificFilter = filter.keys.get(field);

            keyFilter = specificFilter ?? filter.other;
        } else {
            keyFilter = filter.any;
        }

        if (keyFilter === true) {
            return {
                any: true,
            };
        } else if (keyFilter === false) {
            return undefined;
        }

        return keyFilter;
    }

    private shouldIncludeChild(
        filter: ConditionalFilter | boolean | undefined,
        field: FilterKey,
    ): boolean {
        if (filter === undefined) {
            return true;
        }

        const fieldFilter = this.getFilterField(filter, field);

        if (fieldFilter === undefined) {
            return false;
        }

        return fieldFilter.include ? fieldFilter.include(field) : true;
    }

    private getChildFilters(
        filters: Map<FilterIdentifer, ConditionalFilter | boolean>,
        field: FilterKey,
    ): Map<FilterIdentifer, ConditionalFilter | boolean> {
        const results = new Map<FilterIdentifer, ConditionalFilter | boolean>();

        for (const [identifier, filter] of filters) {
            const fieldFilter =
                filter !== undefined
                    ? this.getFilterField(filter, field)
                    : true;

            if (fieldFilter) {
                results.set(identifier, fieldFilter);
            }
        }

        return results;
    }

    private createObjectHandler(
        info: PatchProxyInfo<ObjectPatch>,
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
                            for (const [
                                filterIdentifier,
                                patch,
                            ] of info.patches) {
                                const filter =
                                    info.filters.get(filterIdentifier);

                                if (!this.shouldIncludeChild(filter, field)) {
                                    continue;
                                }

                                const childPatch =
                                    childInfo.patches.get(filterIdentifier);
                                if (childPatch === undefined) {
                                    continue;
                                }

                                if (patch.c === undefined) {
                                    patch.c = new Map();
                                }

                                patch.c.set(field, childPatch);
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
                            addChildToOutput,
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
                    for (const [filterIdentifier, patch] of info.patches) {
                        const filter = info.filters.get(filterIdentifier);

                        if (!this.shouldIncludeChild(filter, field)) {
                            continue;
                        }

                        if (patch.s === undefined) {
                            patch.s = new Map();
                        }

                        patch.s.set(field, val);

                        patch.d?.delete(field);
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
                    for (const [filterIdentifier, patch] of info.patches) {
                        const filter = info.filters.get(filterIdentifier);

                        if (!this.shouldIncludeChild(filter, field)) {
                            continue;
                        }

                        if (patch.d === undefined) {
                            patch.d = new Set();
                        }

                        patch.d.add(field);

                        patch.s?.delete(field);
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
        operation: ArrayOperation,
    ) {
        const getNewIndex = getArrayChildIndexAdjustment(operation);

        for (const [child, index] of info.uncreatedChildPatchIndexes) {
            const newIndex = getNewIndex?.(index) ?? null;

            if (newIndex !== null) {
                info.uncreatedChildPatchIndexes.set(child, newIndex);
            }

            info.uncreatedChildPatchIndexes.delete(child);
        }

        if (getNewIndex !== null) {
            for (const patch of info.patches.values()) {
                updateArrayPatchChildIndexes(patch, getNewIndex);
            }
        }
    }

    private createArrayHandler(info: ArrayPatchProxyInfo): ProxyHandler<any[]> {
        for (const filter of info.filters.values()) {
            if (filter !== true && filter !== false && 'keys' in filter) {
                throw new Error(
                    'Cannot filter keys of an array: only "any" filter can be used on an array',
                );
            }
        }

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

                        const operation: ArrayOperation = {
                            o: ArrayOperationType.Splice,
                            i: start,
                            d: deleteCount,
                            n: items,
                        };

                        this.adjustArrayChildIndexes(info, operation);

                        this.addArrayOp(info, operation);

                        return target.splice(start, deleteCount, ...items);
                    };
                } else if (field === 'shift') {
                    return () => {
                        const operation: ArrayOperation = {
                            o: ArrayOperationType.Shift,
                        };

                        this.addArrayOp(info, operation);

                        this.adjustArrayChildIndexes(info, operation);

                        const shifted = target.shift();

                        this.removeProxy(shifted);

                        return shifted;
                    };
                } else if (field === 'unshift') {
                    return (...items: any[]) => {
                        const operation: ArrayOperation = {
                            o: ArrayOperationType.Unshift,
                            n: items,
                        };

                        this.addArrayOp(info, operation);

                        // update child patch indices... i
                        this.adjustArrayChildIndexes(info, operation);

                        return target.unshift(...items);
                    };
                } else if (field === 'reverse') {
                    return () => {
                        const operation: ArrayOperation = {
                            o: ArrayOperationType.Reverse,
                            l: (info.underlying as any[]).length,
                        };

                        this.addArrayOp(info, operation);

                        this.adjustArrayChildIndexes(info, operation);

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
                            parseInt(field),
                        );

                        const addChildToOutput = () => {
                            for (const [
                                filterIdentifier,
                                patch,
                            ] of info.patches) {
                                const filter =
                                    info.filters.get(filterIdentifier);

                                if (!this.shouldIncludeChild(filter, field)) {
                                    continue;
                                }

                                if (patch.c === undefined) {
                                    patch.c = new Map();
                                }
                            }

                            const index =
                                info.uncreatedChildPatchIndexes.get(val);
                            if (index !== undefined) {
                                for (const [
                                    filterIdentifier,
                                    patch,
                                ] of info.patches) {
                                    const filter =
                                        info.filters.get(filterIdentifier);

                                    if (
                                        !this.shouldIncludeChild(filter, index)
                                    ) {
                                        continue;
                                    }

                                    const childPatch =
                                        childInfo.patches.get(filterIdentifier);

                                    if (childPatch === undefined) {
                                        continue;
                                    }

                                    patch.c!.set(index, childPatch);
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
                            addChildToOutput,
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
        info: PatchProxyInfo<MapPatch>,
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
                                const addChildToOutput = () => {
                                    for (const [
                                        filterIdentifier,
                                        patch,
                                    ] of info.patches) {
                                        const filter =
                                            info.filters.get(filterIdentifier);

                                        if (
                                            !this.shouldIncludeChild(
                                                filter,
                                                key,
                                            )
                                        ) {
                                            continue;
                                        }

                                        const childPatch =
                                            childInfo.patches.get(
                                                filterIdentifier,
                                            );

                                        if (childPatch === undefined) {
                                            continue;
                                        }

                                        if (patch.c === undefined) {
                                            patch.c = new Map();
                                        }

                                        patch.c.set(key, childPatch);
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
                                    addChildToOutput,
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
                            for (const [
                                filterIdentifier,
                                patch,
                            ] of info.patches) {
                                const filter =
                                    info.filters.get(filterIdentifier);

                                if (!this.shouldIncludeChild(filter, key)) {
                                    continue;
                                }

                                if (patch.s === undefined) {
                                    patch.s = new Map();
                                }

                                patch.s.set(key, val);

                                if (isSet(patch.d)) {
                                    patch.d.delete(key);
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
                            for (const [
                                filterIdentifier,
                                patch,
                            ] of info.patches) {
                                const filter =
                                    info.filters.get(filterIdentifier);

                                if (!this.shouldIncludeChild(filter, key)) {
                                    continue;
                                }

                                if (patch.d !== true) {
                                    if (patch.d === undefined) {
                                        patch.d = new Set();
                                    }

                                    patch.d.add(key);
                                }

                                if (patch.s !== undefined) {
                                    patch.s.delete(key);
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
        info: PatchProxyInfo<SetPatch>,
    ): ProxyHandler<Set<any>> {
        return {
            get: (target, field) => {
                let func;

                if (field === 'add') {
                    func = (val: any) => {
                        target.add(val);

                        if (this.isAllowedMapKey(val)) {
                            for (const patch of info.patches.values()) {
                                if (patch.a === undefined) {
                                    patch.a = new Set();
                                }
                                patch.a.add(val);

                                if (isSet(patch.d)) {
                                    patch.d.delete(val);
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
                                        patch.d = new Set();
                                    }
                                    patch.d.add(val);
                                }

                                if (patch.a !== undefined) {
                                    patch.a.delete(val);
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
        filters: Map<FilterIdentifer, ConditionalFilter | boolean>,
        parent?: ProxyInfo,
        addToOutput?: () => void,
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

        for (const filterIdentifier of filters.keys()) {
            info.patches.set(filterIdentifier, {});
        }

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
                info as PatchProxyInfo<ObjectPatch>,
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
