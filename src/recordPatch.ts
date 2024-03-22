import { stringify } from 'enhancejson';
import { Filter } from './Filter';
import { FilterKey, ProxyManager } from './ProxyManager';

type SinglePatchReturnValue<T> = {
    proxy: T;
    getPatch: () => string | null;
}

type MultiFilterReturnValue<T> = {
    proxy: T;
    getFilteredPatches: () => Map<FilterKey, string | null>;
}

export function recordPatch<T extends object>(tree: T, filter?: Filter): SinglePatchReturnValue<T>;
export function recordPatch<T extends object>(tree: T, filter: Map<FilterKey, Filter>): MultiFilterReturnValue<T>;
export function recordPatch<T extends object>(tree: T, filter?: Filter | Map<FilterKey, Filter>) {
    let passedFilterMap = false;
    
    let filters: Map<FilterKey | null, Filter>;
    if (filter === undefined) {
        filters = new Map<FilterKey | null, Filter>()
        filters.set(null, { otherKeys: { include: true } })
    }
    else if (!(filter instanceof Map)) {
        const onlyFilter = filter;
        filters = new Map<FilterKey | null, Filter>();
        filters.set(null, onlyFilter);
    }
    else {
        passedFilterMap = true;
        filters = filter as Map<FilterKey | null, Filter>;
    }

    const manager = new ProxyManager(tree, filters);

    return {
        proxy: manager.rootProxy,
        getFilteredPatches: () => {
            if (!passedFilterMap) {
                throw new Error('A Map of filters was not passed to recordPatch ... call  getPatch instead of getFilteredPatches');
            }

            const patches = manager.getPatches();
            
            const result = new Map<FilterKey, string>();
            for (const [key, patch] of patches) {
                if (key !== null) {
                    result.set(key, stringify(patch));
                }
            }

            return result;
        },
        getPatch: () => {
            if (passedFilterMap) {
                throw new Error('A Map of filters was passed to recordPatch ... call getFilteredPatches instead of getPatch');
            }

            const patches = manager.getPatches();
            const patch = patches.get(null);

            return patch === undefined
                ? null
                : stringify(patch);
        }
    };
}
