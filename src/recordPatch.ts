import { Filter } from './Filter';
import { Patch } from './Patch';
import { FilterIdentifer, ProxyManager } from './ProxyManager';

type PatchReturnValue<T> = {
    proxy: T;
    getPatch: () => Patch;
};

type SingleFilterPatchReturnValue<T> = {
    proxy: T;
    updateConditionalIncludes: () => void;
    getPatch: () => Patch;
};

type MultiFilterReturnValue<T> = {
    proxy: T;
    updateConditionalIncludes: () => void;
    getPatches: () => Map<SpecifiedFilterIdentifier, Patch>;
};

type SpecifiedFilterIdentifier = Exclude<FilterIdentifer, null>;

export function recordPatch<T extends object>(tree: T): PatchReturnValue<T>;
export function recordPatch<T extends object>(
    tree: T,
    filter: Filter
): SingleFilterPatchReturnValue<T>;
export function recordPatch<T extends object>(
    tree: T,
    filter: Map<SpecifiedFilterIdentifier, Filter>
): MultiFilterReturnValue<T>;
export function recordPatch<T extends object>(
    tree: T,
    filter?: Filter | Map<SpecifiedFilterIdentifier, Filter>
):
    | PatchReturnValue<T>
    | SingleFilterPatchReturnValue<T>
    | MultiFilterReturnValue<T> {
    let mode: 1 | 2 | 3;

    let filters: Map<FilterIdentifer, Filter>;
    if (filter === undefined) {
        mode = 1;
        filters = new Map<FilterIdentifer, Filter>();
        filters.set(null, { otherKeys: true });
    } else if (!(filter instanceof Map)) {
        mode = 2;
        const onlyFilter = filter;
        filters = new Map<FilterIdentifer, Filter>();
        filters.set(null, onlyFilter);
    } else {
        mode = 3;
        filters = filter as Map<FilterIdentifer, Filter>;
    }

    const manager = new ProxyManager(tree, filters);

    if (mode === 1) {
        // No filter, return PatchReturnValue<T>
        return {
            proxy: manager.rootProxy,
            getPatch: () => {
                const patches = manager.getPatches();
                return patches.get(null) ?? {};
            },
        };
    } else if (mode === 2) {
        // Single filter, return SingleFilterPatchReturnValue<T>
        return {
            proxy: manager.rootProxy,
            updateConditionalIncludes: manager.updateConditionalIncludes,
            getPatch: () => {
                const patches = manager.getPatches();
                return patches.get(null) ?? {};
            },
        };
    } else {
        // Multiple filters, return MultiFilterReturnValue<T>
        return {
            proxy: manager.rootProxy,
            updateConditionalIncludes: manager.updateConditionalIncludes,
            getPatches: manager.getPatches as () => Map<
                SpecifiedFilterIdentifier,
                Patch
            >,
        };
    }
}
