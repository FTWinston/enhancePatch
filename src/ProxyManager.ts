import { isArray } from 'enhancejson/lib/typeChecks';
import type { Operation } from './Operation';
import { OperationType } from './OperationType';

interface BaseObject {}

interface ProxyInfo {
    path: string;
    proxy: BaseObject;
    underlying: BaseObject;
    proxiedChildren: Set<BaseObject>;
}

export class ProxyManager {
    private readonly proxies = new WeakMap<BaseObject, ProxyInfo>();

    constructor(
        private readonly patchCallback: (operation: Operation) => void
    ) {}

    public createProxy(underlying: BaseObject, path: string) {
        const proxiedChildren = new Set<BaseObject>();

        const proxy: BaseObject = new Proxy(underlying, {
            get: (target, field) => {
                const val = (target as any)[field];

                let fieldProxy: BaseObject | undefined;

                if (typeof field === 'string' && field !== 'prototype') {
                    const fieldProxyInfo = this.proxies.get(val);

                    if (fieldProxyInfo) {
                        fieldProxy = fieldProxyInfo.proxy;
                    } else if (this.canProxy(val)) {
                        const childPath =
                            path === '' ? field : `${path}/${field}`;

                        fieldProxy = this.createProxy(val, childPath);
                        proxiedChildren.add(val);
                    }
                }

                return fieldProxy === undefined ? val : fieldProxy;
            },
            set: (target, field, val) => {
                const prevVal = (target as any)[field];

                (target as any)[field] = val;

                if (typeof field === 'string') {
                    proxiedChildren.delete(prevVal);
                    this.removeProxy(prevVal);

                    // Don't record array length changes. TODO: separate array proxy I guess.
                    if (!isArray(target) || field !== 'length') {
                        this.patchCallback(
                            this.createSetOperation(path, field, val)
                        );
                    }
                }

                return true;
            },
            deleteProperty: (target, field) => {
                const val = (target as any)[field];

                delete (target as any)[field];

                if (typeof field === 'string') {
                    proxiedChildren.delete(val);
                    this.removeProxy(val);

                    this.patchCallback(this.createDeleteOperation(path, field));
                }

                return true;
            },
        });

        this.proxies.set(underlying, {
            path,
            proxy,
            proxiedChildren,
            underlying,
        });

        return proxy;
    }

    private canProxy(object: any) {
        if (this.proxies.has(object)) {
            return false;
        }

        const type = typeof object;
        return type === 'function' || (type === 'object' && !!object);
    }

    private removeProxy(object: object) {
        const proxyInfo = this.proxies.get(object);

        if (!proxyInfo) {
            return;
        }

        this.proxies.delete(object);

        // Recursively delete any child proxies still being held onto.
        for (const childObject of proxyInfo.proxiedChildren) {
            this.removeProxy(childObject);
        }
    }

    private createSetOperation(
        path: string,
        field: string,
        val: any
    ): Operation {
        return {
            p: path,
            o: OperationType.SingleValue,
            k: field,
            v: val,
        };
    }

    private createDeleteOperation(path: string, field: string): Operation {
        return {
            p: path,
            o: OperationType.Delete,
            k: field,
        };
    }
}
