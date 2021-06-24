import { stringify } from 'enhancejson/lib/stringify';
import { managersByProxy } from './ProxyManager';

export function finishRecording<T extends object>(proxy: T): string | null {
    const manager = managersByProxy.get(proxy);

    if (manager === undefined) {
        return null;
    }

    managersByProxy.delete(proxy);

    const patch = manager.rootPatch;

    return patch === undefined ? null : stringify(patch);
}
