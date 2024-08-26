import {
    ArrayPatch,
    MapKey,
    MapPatch,
    ObjectPatch,
    Patch,
    SetPatch,
} from './Patch';
import { isArray, isMap, isObject, isSet } from './typeChecks';
import {
    ArrayOperation,
    ArrayOperationType,
} from './ArrayOperation';

function patchObject(tree: Record<string, any>, patch: ObjectPatch) {
    if (patch.d) {
        for (const key of patch.d) {
            delete tree[key];
        }
    }

    if (patch.s) {
        for (const [key, value] of patch.s) {
            tree[key] = value;
        }
    }

    if (patch.c) {
        for (const [key, childPatch] of patch.c) {
            let childTree = tree[key];
            childTree = applyPatch(childTree, childPatch);
            tree[key] = childTree;
        }
    }

    return tree;
}

function applyArrayOperation(tree: any[], operation: ArrayOperation) {
    switch (operation.o) {
        case ArrayOperationType.Set:
            tree[operation.i] = operation.v;
            break;
        case ArrayOperationType.Delete:
            delete tree[operation.i];
            break;
        case ArrayOperationType.Splice:
            if (operation.n !== undefined) {
                tree.splice(operation.i, operation.d, ...operation.n);
            } else {
                tree.splice(operation.i, operation.d);
            }
            break;
        case ArrayOperationType.Shift:
            tree.shift();
            break;
        case ArrayOperationType.Unshift:
            tree.unshift(...operation.n);
            break;
        case ArrayOperationType.Reverse:
            tree.reverse();
            break;
        default:
            const val: never = operation;
            throw new Error(
                `Unexpected operation type: ${JSON.stringify(operation)}`,
            );
    }
}

function patchArray(tree: any[], patch: ArrayPatch) {
    if (patch.o) {
        for (const op of patch.o) {
            applyArrayOperation(tree, op);
        }
    }

    if (patch.c) {
        for (const [key, childPatch] of patch.c) {
            let childTree = tree[key];
            childTree = applyPatch(childTree, childPatch);
            tree[key] = childTree;
        }
    }

    return tree;
}

function mapAndSetDelete(
    tree: Map<MapKey, any> | Set<MapKey>,
    patch: MapPatch | SetPatch,
) {
    if (patch.d) {
        if (patch.d === true) {
            tree.clear();
        } else {
            for (const key of patch.d) {
                tree.delete(key);
            }
        }
    }
}

function patchMap(tree: Map<MapKey, any>, patch: MapPatch) {
    mapAndSetDelete(tree, patch);

    if (patch.s) {
        for (const [key, val] of patch.s) {
            tree.set(key, val);
        }
    }

    if (patch.c) {
        for (const [key, childPatch] of patch.c) {
            let childTree = tree.get(key);
            childTree = applyPatch(childTree, childPatch);
            tree.set(key, childTree);
        }
    }

    return tree;
}

function patchSet(tree: Set<MapKey>, patch: SetPatch) {
    mapAndSetDelete(tree, patch);

    if (patch.a) {
        for (const key of patch.a) {
            tree.add(key);
        }
    }

    return tree;
}

/**
 * Apply a patch to a known object tree, returning a new object tree that is the result of doing this.
 * @param tree object tree to which the patch should be applied
 * @param patch patch to apply to the tree
 * @returns A new object tree that is the result of applying the patch
 */
export function applyPatch<T extends object>(tree: T, patch: Patch): T {
    if (isArray(tree)) {
        const array = tree.slice();
        return patchArray(array, patch as ArrayPatch) as T;
    } else if (isMap(tree)) {
        const map = new Map(tree);
        return patchMap(map, patch as MapPatch) as T;
    } else if (isSet(tree)) {
        const set = new Set(tree);
        return patchSet(set, patch as SetPatch) as T;
    } else if (isObject(tree)) {
        const object = { ...tree };
        return patchObject(object, patch as ObjectPatch) as T;
    } else {
        const msg =
            tree === null || tree === undefined
                ? 'Cannot apply patch, target object is missing'
                : `Cannot apply patch, target object has unexpected type: ${typeof tree}`;

        throw new Error(msg);
    }
}
