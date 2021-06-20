import {
    ArrayPatch,
    MapPatch,
    ObjectPatch,
    Patch,
    PatchType,
    SetPatch,
} from './Patch';
import { parse } from 'enhancejson/lib/parse';
import { clone } from './clone';
import {
    ArrayOperation,
    ArrayOperationType,
    ArraySpliceOperation2,
} from './ArrayOperation';

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
            const childTree = tree[key];
            applyPatchInternal(childTree, childPatch);
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
            const childTree = tree[key as unknown as number];
            applyPatchInternal(childTree, childPatch);
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
        for (const [key, val] of Object.entries(patch.s)) {
            tree.set(key, val);
        }
    }

    if (patch.S) {
        for (const [key, val] of Object.entries(patch.S)) {
            tree.set(parseFloat(key), val);
        }
    }

    if (patch.c) {
        for (const [key, childPatch] of Object.entries(patch.c)) {
            const childTree = tree.get(key);
            applyPatchInternal(childTree, childPatch);
        }
    }

    if (patch.C) {
        for (const [key, childPatch] of Object.entries(patch.C)) {
            const childTree = tree.get(parseFloat(key));
            applyPatchInternal(childTree, childPatch);
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

function applyPatchInternal(tree: {}, patch: Patch) {
    tree = clone(tree);

    switch (
        patch.t // TODO: or should we look at tree itself? clone just did that!
    ) {
        case PatchType.Object:
            return patchObject(tree, patch);
        case PatchType.Array:
            return patchArray(tree as any[], patch);
        case PatchType.Map:
            return patchMap(tree as Map<string | number, any>, patch);
        case PatchType.Set:
            return patchSet(tree as Set<any>, patch);
        default:
            return tree;
    }
}

export function applyPatch(tree: {}, patch: string | Patch) {
    if (typeof patch === 'string') {
        patch = parse(patch) as Patch;
    }

    applyPatchInternal(tree, patch);

    return tree;
}
