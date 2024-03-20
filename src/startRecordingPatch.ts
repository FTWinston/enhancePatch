import { managersByProxy, ProxyManager } from './ProxyManager';

export function startRecordingPatch<T extends object>(tree: T): T {
    const manager = new ProxyManager(tree);

    const treeProxy = manager.rootProxy;

    managersByProxy.set(treeProxy, manager);

    return treeProxy;
}
