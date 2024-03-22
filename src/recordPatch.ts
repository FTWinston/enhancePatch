import { stringify } from 'enhancejson';
import { Filter } from './Filter';
import { FilterKey, ProxyManager } from './ProxyManager';

type ReturnValue<T> = {
    proxy: T;
    getPatch: () => string | null;
    getFilteredPatches: () => Map<FilterKey, string | null>;
}

export function recordPatch<T extends object>(tree: T, filter?: Filter | Map<FilterKey, Filter>): ReturnValue<T> {
    let passedFilterMap = false;
    
    if (filter === undefined) {
        filter = new Map<FilterKey, Filter>()
        filter.set(null, { otherKeys: { include: true } })
    }
    else if (!(filter instanceof Map)) {
        const onlyFilter = filter;
        filter = new Map<FilterKey, Filter>();
        filter.set(null, onlyFilter);
    }
    else {
        passedFilterMap = true;
    }

    const manager = new ProxyManager(tree, filter);

    return {
        proxy: manager.rootProxy,
        getFilteredPatches: () => {
            if (!passedFilterMap) {
                throw new Error('A Map of filters was not passed to recordPatch ... call  getPatch instead of getFilteredPatches');
            }

            const patches = manager.getPatches();
            
            const result = new Map<FilterKey, string>();
            for (const [key, patch] of patches) {
                result.set(key, stringify(patch));
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
