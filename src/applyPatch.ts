import { createMap } from './createMap';
import { createSet } from './createSet';
import { Operation } from './Operation';
import * as OperationType from './OperationType';
import { reallocate } from './reallocate';
import { removeValue } from './removeValue';
import { setValue } from './setValue';
import { splitPath } from './splitPath';
import { isArray } from './types';

function applyOperation(operation: Operation, tree: any) {
    const segments = splitPath(operation.p);
    const [newTree, parentElement] = reallocate(tree, segments);

    if (newTree === null) {
        return tree;
    }

    switch (operation.o) {
        case OperationType.SetValue:
            if (isArray(operation.k)) {
                const length = Math.min(operation.k.length, operation.v.length);
                for (let i = 0; i < length; i++) {
                    setValue(parentElement, operation.k[i], operation.v[i]);
                }
            } else {
                setValue(parentElement, operation.k, operation.v);
            }
            break;
        case OperationType.RemoveValue:
            if (isArray(operation.k)) {
                for (let i = operation.k.length - 1; i >= 0; i--) {
                    removeValue(parentElement, operation.k[i]);
                }
            } else {
                removeValue(parentElement, operation.k);
            }
            break;
        case OperationType.InitMap:
            const map = createMap(operation.v);
            setValue(parentElement, operation.k, map);
            break;
        case OperationType.InitSet:
            const set = createSet(operation.v);
            setValue(parentElement, operation.k, set);
            break;
        default:
            const val: never = operation;
            throw new Error(`Unexpected operation type: ${JSON.stringify(operation)}`);
    }

    return newTree;
}

export function applyPatch(patch: Operation[], tree: any) {
    for (const operation of patch) {
        tree = applyOperation(operation, tree);
    }

    return tree;
}
