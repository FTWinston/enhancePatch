import { ArrayPatch, MapPatch, ObjectPatch, Patch, SetPatch } from './Patch';
import { parse } from 'enhancejson/lib/parse';
import {
    ArrayOperation,
    ArrayOperationType,
    ArraySpliceOperation2,
} from './ArrayOperation';
import { isArray, isMap, isObject, isSet } from 'enhancejson/lib/typeChecks';

function patchObject(tree: Record<string, any>, patch: ObjectPatch) {
    if (patch.s) {
        tree = {
            ...tree,
            ...patch.s,
        };
    }

    if (patch.d) {
        for (const key of patch.d) {
            delete tree[key];
        }
    }

    if (patch.c) {
        for (const [key, childPatch] of Object.entries(patch.c)) {
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
            tree.splice(operation.i, 1);
            break;
        case ArrayOperationType.Splice:
            if ((operation as any).n) {
                const op = operation as ArraySpliceOperation2;
                tree.splice(op.i, op.d, ...op.n);
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
                `Unexpected operation type: ${JSON.stringify(operation)}`
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
        for (const [key, childPatch] of Object.entries(patch.c)) {
            const numKey = key as unknown as number;
            let childTree = tree[numKey];
            childTree = applyPatch(childTree, childPatch);
            tree[numKey] = childTree;
        }
    }

    return tree;
}

function mapAndSetDelete(
    tree: Map<any, any> | Set<any>,
    patch: MapPatch | SetPatch
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

function patchMap(tree: Map<string | number, any>, patch: MapPatch) {
    mapAndSetDelete(tree, patch);

    if (patch.s) {
        for (const [key, val] of patch.s) {
            tree.set(key, val);
        }
    }

    if (patch.c) {
        for (const [key, childPatch] of Object.entries(patch.c)) {
            let childTree = tree.get(key);
            childTree = applyPatch(childTree, childPatch);
            tree.set(key, childTree);
        }
    }

    if (patch.C) {
        for (const [key, childPatch] of Object.entries(patch.C)) {
            let numKey = parseFloat(key);
            let childTree = tree.get(numKey);
            childTree = applyPatch(childTree, childPatch);
            tree.set(numKey, childTree);
        }
    }

    return tree;
}

function patchSet(tree: Set<any>, patch: SetPatch) {
    mapAndSetDelete(tree, patch);

    if (patch.a) {
        for (const key of patch.a) {
            tree.add(key);
        }
    }

    return tree;
}

function applyPatch(tree: {}, patch: Patch) {
    if (isArray(tree)) {
        const array = tree.slice();
        return patchArray(array, patch as ArrayPatch);
    } else if (isMap(tree)) {
        const map = new Map(tree);
        return patchMap(map, patch as MapPatch);
    } else if (isSet(tree)) {
        const set = new Set(tree);
        return patchSet(set, patch as SetPatch);
    } else if (isObject(tree)) {
        const object = { ...tree };
        return patchObject(object, patch as ObjectPatch);
    } else {
        const msg =
            tree === null || tree === undefined
                ? 'Cannot apply patch, target object is missing'
                : `Cannot apply patch, target object has unexpected type: ${typeof tree}`;

        throw new Error(`${msg}: ${JSON.stringify(patch)}`);
    }
}

export function applyChanges(tree: {}, patch: string | Patch) {
    if (typeof patch === 'string') {
        patch = parse(patch) as Patch;
    }

    return applyPatch(tree, patch);
}
