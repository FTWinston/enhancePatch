import { Operation } from './Operation';
import { ProxyManager } from './ProxyManager';

export function recordChanges(
    object: any,
    patchCallback: (operation: Operation) => void
): any {
    const manager = new ProxyManager(patchCallback);
    return manager.createProxy(object, '');
}
