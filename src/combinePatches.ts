import { applyPatch } from './applyPatch';
import {
    getArrayChildIndexAdjustment,
    updateArrayPatchChildIndexes,
} from './arrayUtils';
import { ArrayPatch, MapKey, Patch } from './Patch';
import { isSet } from './typeChecks';

/** Add all items from one Set into another. */
function combineSets<TKey>(
    target: Set<TKey>,
    additions: ReadonlySet<TKey> | IterableIterator<TKey>,
) {
    for (const item of additions) {
        target.add(item);
    }
}

/** Add all entries from one Map into another, overwriting existing values. */
function combineMaps<TKey, TValue>(
    target: Map<TKey, TValue>,
    additions: ReadonlyMap<TKey, TValue> | Iterable<readonly [TKey, TValue]>,
) {
    for (const [key, value] of additions) {
        target.set(key, value);
    }
}

/** Remove all entries from Map whose key is present in a separate Set. */
function removeKeys<TKey>(
    target: Map<TKey, unknown> | Set<TKey>,
    keysToExclude: ReadonlySet<TKey> | IterableIterator<TKey>,
) {
    for (const key of keysToExclude) {
        target.delete(key);
    }
}

/**
 * Merge a patch into a target patch, so that the target contains all changes from both patches.
 * Modifies the target patch, but won't modify (or directly re-use members of) the addition.
 */
function appendPatch(target: Patch, addition: Patch) {
    // Add deletions, and potentially remove existing settings or child patches.
    if ('d' in addition && addition.d !== undefined) {
        if (isSet(addition.d)) {
            // Add to target.d, and remove corresponding entries from target.s and target.c
            if ('d' in target && isSet(target.d)) {
                combineSets(target.d, addition.d);
            } else if (!('d' in target) || target.d !== true) {
                (target as any).d = new Set(addition.d);
            }

            if ('s' in target && target.s !== undefined) {
                removeKeys(target.s, addition.d);
            } else if ('a' in target && target.a !== undefined) {
                removeKeys(target.a, addition.d);
            }

            if ('c' in target && target.c !== undefined) {
                removeKeys(target.c, addition.d);
            }
        } else {
            // As addition.d is true, make target.d true, and discard target.s, target.a, and target.c
            (target as any).d = true;

            if ('s' in target && target.s !== undefined) {
                delete target.s;
            } else if ('a' in target && target.a !== undefined) {
                delete target.a;
            }

            if ('c' in target && target.c !== undefined) {
                delete target.c;
            }
        }
    }

    // Add settings, and potentially remove existing deletions or child patches.
    if ('s' in addition && addition.s !== undefined) {
        // Add to target.s, and remove corresponding entries from target.d and target.c
        if ('s' in target && target.s !== undefined) {
            combineMaps(target.s, addition.s);
        } else {
            (target as any).s = new Map(addition.s);
        }

        if ('d' in target && isSet(target.d)) {
            removeKeys(target.d, addition.s.keys());
        }

        if ('c' in target && target.c !== undefined) {
            removeKeys(target.c, addition.s.keys());
        }
    } else if ('a' in addition && addition.a !== undefined) {
        // Add to target.a, and remove corresponding entries from target.d
        if ('a' in target && target.a !== undefined) {
            combineSets(target.a, addition.a);
        } else {
            (target as any).a = new Set(addition.a);
        }

        if ('d' in target && isSet(target.d)) {
            removeKeys(target.d, addition.a);
        }
    }

    // Add array operations, potentially updating existing child patches, as their indexes must be changed.
    if ('o' in addition && addition.o !== undefined) {
        if ('o' in target && target.o !== undefined) {
            target.o = [...target.o, ...addition.o];
        } else {
            (target as ArrayPatch).o = [...addition.o];
        }

        if ('c' in target && target.c !== undefined) {
            // For each operation in addition.o, determine how it would update array indexes, and then apply that to target.c keys.
            // We do this because addition.o operations will be processed before target.c, which previously didn't account for them.
            for (const operation of addition.o) {
                const getNewIndex = getArrayChildIndexAdjustment(operation);
                if (getNewIndex !== null) {
                    updateArrayPatchChildIndexes(
                        target as ArrayPatch,
                        getNewIndex,
                    );
                }
            }
        }
    }

    // Add child patches, potentially updating corresponding existing child patches.
    if ('c' in addition && addition.c !== undefined) {
        // Add to result.c, unless we should instead update an existing entry in target.c or target.s
        const targetC =
            'c' in target && target.c !== undefined
                ? new Map<MapKey, Patch>(target.c)
                : new Map<MapKey, Patch>();

        for (const [key, childPatch] of addition.c) {
            const targetPatchValue = targetC.get(key);

            if (targetPatchValue !== undefined) {
                // Target already has a patch for this child, so combine the two patches.
                const combinedPatch = combinePatches(
                    targetPatchValue,
                    childPatch,
                );
                targetC.set(key, combinedPatch);
                continue;
            } else if ('s' in target && target.s !== undefined) {
                const targetSetValue = target.s.get(key as string);

                if (targetSetValue !== undefined) {
                    // Result sets this value, so just apply this child patch to the value it sets.
                    const appliedPatch = applyPatch(targetSetValue, childPatch);
                    target.s.set(key as string, appliedPatch);
                    continue;
                }
            }

            // Add to target.c
            targetC.set(key, childPatch);
        }

        if (targetC.size > 0) {
            (target as any).c = targetC;
        }
    }
}

/**
 * Merge multiple patches into one, returning a new patch that contains all changes from all patches.
 * @param patches All patches to be merged, in order from oldest to newest.
 */
export function combinePatches(...patches: Patch[]): Patch {
    const result: Patch = {};

    for (let i = 0; i < patches.length; i++) {
        appendPatch(result, patches[i]);
    }

    return result;
}
