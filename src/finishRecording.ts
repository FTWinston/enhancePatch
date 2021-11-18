import { stringify } from 'enhancejson';
import { ArrayPatch, MapPatch, ObjectPatch, Patch, SetPatch } from './Patch';
import { managersByProxy } from './ProxyManager';

export function finishRecordingRaw(proxy: Map<any, any>): MapPatch | null;
export function finishRecordingRaw(proxy: Set<any>): SetPatch | null;
export function finishRecordingRaw(proxy: Array<any>): ArrayPatch | null;
export function finishRecordingRaw(proxy: object): ObjectPatch | null;
export function finishRecordingRaw(proxy: object): Patch | null {
    const manager = managersByProxy.get(proxy);

    if (manager === undefined) {
        return null;
    }

    managersByProxy.delete(proxy);

    const patch = manager.rootPatch;

    return patch === undefined ? null : patch;
}

export function finishRecording(proxy: object): string | null {
    const patch = finishRecordingRaw(proxy);

    return patch === null ? null : stringify(patch);
}
