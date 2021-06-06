import { Operation } from './Operation';

// For each operation, see if we can combine it with previous operation.
// Or, if there's "set" operation already in there (whose value is an object) for which
// the current operation's path starts with its path + key, just dump the current operation,
// as patches store live copies of operations.
export function optimisePatch(operations: Operation[]): Operation[] {
    // TODO: implement this properly
    return operations;
}
