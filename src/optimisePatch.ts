import { Operation } from './Operation';
import { OperationType } from './OperationType';

// For each operation, see if we can combine it with the previous operation.
// Or, if there's "set" operation already in there (whose value is an object) for which
// the current operation's path starts with its path + key, just dump the current operation,
// as patches store live copies of operations.
export function optimisePatch(operations: Operation[]): Operation[] {
    const opsByPath = new Map<string | undefined, Operation>();

    return operations.reduce((results, operation) => {
        const prevOp = opsByPath.get(operation.p);

        if (prevOp) {
            if (prevOp.o === operation.o) {
                // Append to prevOp
                if (prevOp.o === OperationType.Set) {
                    prevOp.v = Array.from(new Map([...prevOp.v, ...(operation as any).v]))
                } else if (prevOp.o === OperationType.Delete) {
                    prevOp.k = Array.from(new Set([...prevOp.k, ...(operation as any).k]))
                }

                return results;
            }

            // Prune any keys in operation from prevOp
            else if (
                operation.o === OperationType.Delete &&
                prevOp.o === OperationType.Set
            ) {
                prevOp.v = prevOp.v.filter(
                    ([key]) => !operation.k.includes(key)
                );
            } else if (
                operation.o === OperationType.Set &&
                prevOp.o === OperationType.Delete
            ) {
                const keysToRemove = new Set(operation.v.map((k) => k[0]));

                prevOp.k = prevOp.k.filter((k) => !keysToRemove.has(k));
            }

            /*
            // And we want to remove any DESCENDANT previous ops.
            else if (operation.o === OperationType.Set || operation.o === OperationType.Delete) {
                const prevIndex = results.indexOf(prevOp);
                results.splice(prevIndex, 1);
            }
            */

            // Forget prevOp if present
            opsByPath.delete(operation.p);
        } else if (
            operation.o === OperationType.Set ||
            operation.o === OperationType.Delete
        ) {
            opsByPath.set(operation.p, operation);
        }

        results.push(operation);

        return results;
    }, [] as Operation[]);
}
