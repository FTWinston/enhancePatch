import { Operation } from './Operation';
import { OperationType } from './OperationType';
import { reallocate } from './reallocate';
import { removeValue } from './removeValue';
import { setValue } from './setValue';
import { parse } from 'enhancejson/lib/parse';
import { isArray } from 'enhancejson/lib/typeChecks';
import { clearValue } from './clearValue';

function applyOperation(tree: any, operation: Operation) {
    const [newTree, parentElement] = reallocate(tree, operation.p ?? []);

    if (newTree === null) {
        return tree;
    }

    switch (operation.o) {
        case OperationType.Set:
            for (const [key, val] of operation.v) {
                setValue(parentElement, key, val);
            }
            break;
        case OperationType.Delete:
            if (isArray(operation.k)) {
                for (let i = operation.k.length - 1; i >= 0; i--) {
                    removeValue(parentElement, operation.k[i]);
                }
            } else {
                removeValue(parentElement, operation.k);
            }
            break;
        case OperationType.Clear:
            clearValue(parentElement);
            break;
        case OperationType.ArraySplice:
            if (isArray(parentElement)) {
                const [index, deleteCount, items] = operation.v;
                parentElement.splice(index, deleteCount, ...items);
            }
            break;
        case OperationType.ArrayShift:
            if (isArray(parentElement)) {
                parentElement.shift();
            }
            break;
        case OperationType.ArrayUnshift:
            if (isArray(parentElement)) {
                parentElement.unshift(...operation.v);
            }
            break;
        case OperationType.ArrayReverse:
            if (isArray(parentElement)) {
                parentElement.reverse();
            }
            break;
        default:
            const val: never = operation;
            throw new Error(
                `Unexpected operation type: ${JSON.stringify(operation)}`
            );
    }

    return newTree;
}

export function applyPatch(tree: any, patch: string | Operation | Operation[]) {
    if (typeof patch === 'string') {
        patch = parse(patch) as Operation | Operation[];
    }

    if (!isArray(patch)) {
        patch = [patch];
    }

    for (const operation of patch) {
        tree = applyOperation(tree, operation);
    }

    return tree;
}
