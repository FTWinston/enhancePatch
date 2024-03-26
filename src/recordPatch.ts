import { stringify } from 'enhancejson';
import { Filter } from './Filter';
import { FilterIdentifer, ProxyManager } from './ProxyManager';

type SinglePatchReturnValue<T> = {
    proxy: T;
    getPatch: () => string | null;
}

type MultiFilterReturnValue<T> = {
    proxy: T;
    getPatches: () => Map<SpecifiedFilterIdentifier, string | null>;
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
                const patches = manager.getPatches();
                
                const result = new Map<SpecifiedFilterIdentifier, string>();
                for (const [key, patch] of patches) {
                    result.set(key!, stringify(patch));
                }
    
                return result;
            },
        }
    }
    else {
        return {
            proxy: manager.rootProxy,
            getPatch: () => {
                const patches = manager.getPatches();
                const patch = patches.get(null);

                return patch === undefined
                    ? null
                    : stringify(patch);
            }
        };
    }
}
