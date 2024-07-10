import { Filter } from './Filter';
import { Patch } from './Patch';
import { FilterIdentifer, ProxyManager } from './ProxyManager';

/** A recordPatch return value when a single, unfiltered patch is wanted */
type PatchReturnValue<T> = {
    /** Proxy of the object tree, through which all modifications should be applied */
    proxy: T;
    /**
     * Function to get the patch representing all modifications made to the object tree.
     * Should only be called one time: subsequent calls will throw an error.
     */
    getPatch: () => Patch;
};

/** A recordPatch return value when a single, filtered patch is wanted */
type SingleFilterPatchReturnValue<T> = {
    /** Proxy of the object tree, through which all modifications should be applied */
    proxy: T;
    /** Function to trigger recalcuation of all conditional include in the patch */
    updateConditionalIncludes: () => void;
    /**
     * Function to get the patch representing all filtered modifications made to the object tree.
     * Should only be called one time: subsequent calls will throw an error.
     */
    getPatch: () => Patch;
};

/** A recordPatch return value when multiple, differently-filtered patches are wanted */
type MultiFilterReturnValue<T> = {
    /** Proxy of the object tree, through which all modifications should be applied */
    proxy: T;
    /** Function to trigger recalcuation of all conditional include in the patch */
    updateConditionalIncludes: () => void;
    /**
     * Function to get the patches representing all filtered modifications made to the object tree.
     * Should only be called one time: subsequent calls will throw an error.
     */
    getPatches: () => Map<SpecifiedFilterIdentifier, Patch>;
};

/** Identifier for a unique filter, when multiple filters are being recorded simultaneously */
type SpecifiedFilterIdentifier = Exclude<FilterIdentifer, null>;

/**
 * Indicate that you wish to begin tracking all changes to an object tree, to subsequently generate a patch of those changes.
 * @param tree Object tree which will be proxied, to track any modifications.
 * @returns A proxy of the tree which should have all modifications applied to it, and a method to retrieve a patch representing those changes.
 */
export function recordPatch<T extends object>(tree: T): PatchReturnValue<T>;
/**
 * Indicate that you wish to begin tracking and filtering changes to an object tree, to subsequently generate a patch of those changes.
 * @param tree Object tree which will be proxied, to track any modifications.
 * @param filter Filter to use when determining whether a change should be included in the recorded patch.
 * @returns A proxy of the tree which should have filtered modifications applied to it, a method to trigger updating of any conditional filters, and a method to retrieve a patch representing those changes.
 */
export function recordPatch<T extends object>(
    tree: T,
    filter: Filter
): SingleFilterPatchReturnValue<T>;
/**
 * Indicate that you wish to begin tracking and filtering multiple sets of changes to an object tree, to subsequently generate patches of those changes.
 * @param tree Object tree which will be proxied, to track any modifications.
 * @param filters A map associating each filter with a unique identifier. For each of these, a separate filtered patch will be recorded.
 * @returns A proxy of the tree which should have filtered modifications applied to it, a method to trigger updating of any conditional filters, and a method to retrieve patches representing those changes, for each provided filter identifier.
 */
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
        filters.set(null, { otherKeys: { include: true } });
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
