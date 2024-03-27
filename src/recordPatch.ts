import { Filter } from './Filter';
import { Patch } from './Patch';
import { FilterIdentifer, ProxyManager } from './ProxyManager';

type SinglePatchReturnValue<T> = {
    proxy: T;
    getPatch: () => Patch;
}

type MultiFilterReturnValue<T> = {
    proxy: T;
    getPatches: () => Map<SpecifiedFilterIdentifier, Patch>;
}

type SpecifiedFilterIdentifier = Exclude<FilterIdentifer, null>;

export function recordPatch<T extends object>(tree: T, filter?: Filter): SinglePatchReturnValue<T>;
export function recordPatch<T extends object>(tree: T, filter: Map<SpecifiedFilterIdentifier, Filter>): MultiFilterReturnValue<T>;
export function recordPatch<T extends object>(tree: T, filter?: Filter | Map<SpecifiedFilterIdentifier, Filter>): SinglePatchReturnValue<T> | MultiFilterReturnValue<T> {
    let passedFilterMap = false;
    
    let filters: Map<FilterIdentifer, Filter>;
    if (filter === undefined) {
        filters = new Map<FilterIdentifer, Filter>();
        filters.set(null, { otherKeys: { include: true } });
    }
    else if (!(filter instanceof Map)) {
        const onlyFilter = filter;
        filters = new Map<FilterIdentifer, Filter>();
        filters.set(null, onlyFilter);
    }
    else {
        passedFilterMap = true;
        filters = filter as Map<FilterIdentifer, Filter>;
    }

    const manager = new ProxyManager(tree, filters);

    if (passedFilterMap) {
        return {
            proxy: manager.rootProxy,
            getPatches: () => {
                return manager.getPatches() as Map<SpecifiedFilterIdentifier, Patch>;
            },
        }
    }
    else {
        return {
            proxy: manager.rootProxy,
            getPatch: () => {
                const patches = manager.getPatches();
                return patches.get(null) ?? {};
            }
        };
    }
}
