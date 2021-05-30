import { stringify } from 'enhancejson/lib/stringify';
import { Operation } from './Operation';
import { ProxyManager } from './ProxyManager';

export function recordChanges(object: any): {
    proxy: any;
    getPatch: () => string | null;
} {
    const patchOperations: Operation[] = [];

    const manager = new ProxyManager((op) => patchOperations.push(op));

    return {
        proxy: manager.createProxy(object, ''),
        getPatch: () => {
            if (patchOperations.length === 0) {
                return null;
            }

            const result = stringify(patchOperations);
            patchOperations.splice(0, patchOperations.length);
            return result;
        },
    };
}
