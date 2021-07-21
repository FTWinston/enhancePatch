import { stringify } from 'enhancejson/lib/stringify';
import { Patch } from './Patch';
import { managersByProxy } from './ProxyManager';

export function finishRecordingRaw<T extends object>(proxy: T): Patch | null {
    const manager = managersByProxy.get(proxy);

    if (manager === undefined) {
        return null;
    }

    managersByProxy.delete(proxy);

    const patch = manager.rootPatch;

    return patch === undefined ? null : patch;
}

export function finishRecording<T extends object>(proxy: T): string | null {
    const patch = finishRecordingRaw(proxy);
    
    return patch === null ? null : stringify(patch);
}
