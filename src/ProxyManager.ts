import { isArray, isMap, isSet } from 'enhancejson/lib/typeChecks';
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

    private getField(
        path: string,
        field: string,
        val: any,
        proxiedChildren: Set<BaseObject>
    ) {
        const fieldProxyInfo = this.proxies.get(val);

        if (fieldProxyInfo) {
            return fieldProxyInfo.proxy;
        }

        if (this.canProxy(val)) {
            proxiedChildren.add(val);

            const childPath = path ? `${path}/${field}` : field;

            return this.createProxy(val, childPath);
        }

        return val;
    }

    private setField(
        path: string,
        field: string,
        val: any,
        prevVal: any,
        proxiedChildren: Set<BaseObject>
    ) {
        proxiedChildren.delete(prevVal);
        this.removeProxy(prevVal);

        this.patchCallback(this.createSetOperation(path, field, val));
    }

    private deleteField(
        path: string,
        field: string,
        val: any,
        proxiedChildren: Set<BaseObject>
    ) {
        proxiedChildren.delete(val);
        this.removeProxy(val);

        this.patchCallback(this.createDeleteOperation(path, field));
    }

    private createObjectHandler(
        path: string,
        proxiedChildren: Set<BaseObject>
    ): ProxyHandler<BaseObject> {
        return {
            get: (target, field) => {
                let val = (target as any)[field];

                if (typeof field === 'string' && field !== 'prototype') {
                    val = this.getField(path, field, val, proxiedChildren);
                }

                return val;
            },
            set: (target, field, val) => {
                const prevVal = (target as any)[field];

                (target as any)[field] = val;

                if (typeof field === 'string') {
                    this.setField(path, field, val, prevVal, proxiedChildren);
                }

                return true;
            },
            deleteProperty: (target, field) => {
                const val = (target as any)[field];

                delete (target as any)[field];

                if (typeof field === 'string') {
                    this.deleteField(path, field, val, proxiedChildren);
                }

                return true;
            },
        };
    }

    private createArrayHandler(
        path: string,
        proxiedChildren: Set<BaseObject>
    ): ProxyHandler<any[]> {
        return {
            get: (target, field) => {
                let val = (target as any)[field];

                if (typeof field === 'string' && field !== 'prototype') {
                    val = this.getField(path, field, val, proxiedChildren);
                }

                return val;
            },
            set: (target, field, val) => {
                const prevVal = (target as any)[field];

                (target as any)[field] = val;

                // Don't record array length changes.
                if (typeof field === 'string' && field !== 'length') {
                    this.setField(path, field, val, prevVal, proxiedChildren);
                }

                return true;
            },
            deleteProperty: (target, field) => {
                const val = (target as any)[field];

                delete (target as any)[field];

                if (typeof field === 'string') {
                    this.deleteField(path, field, val, proxiedChildren);
                }

                return true;
            },
        };
    }

    private isAllowedMapKey(key: any) {
        switch (typeof key) {
            case 'string':
            case 'number':
                return true;
            default:
                return false;
        }
    }

    private createMapHandler(
        path: string,
        proxiedChildren: Set<BaseObject>
    ): ProxyHandler<Map<any, any>> {
        return {
            get: (target, field) => {
                let func;

                if (field === 'get') {
                    func = (key: any) => {
                        let val = target.get(key);

                        if (this.isAllowedMapKey(key)) {
                            val = this.getField(
                                path,
                                field,
                                val,
                                proxiedChildren
                            );
                        }

                        return val;
                    };
                } else if (field === 'set') {
                    func = (key: any, val: any) => {
                        const prevVal = target.get(key);

                        target.set(key, val);

                        if (this.isAllowedMapKey(key)) {
                            this.setField(
                                path,
                                key,
                                val,
                                prevVal,
                                proxiedChildren
                            );
                        }

                        return this;
                    };
                } else if (field === 'delete') {
                    func = (key: any) => {
                        const val = target.get(key);

                        target.delete(key);

                        if (this.isAllowedMapKey(key)) {
                            this.deleteField(path, field, val, proxiedChildren);
                        }

                        return this;
                    };
                } else if (field === 'clear') {
                    func = () => {
                        target.clear();
                        // TODO: generate patch
                    };
                } else {
                    let val = (target as any)[field];

                    if (typeof val === 'function') {
                        val = val.bind(target);
                    }

                    return val;
                }

                return func.bind(target);
            },
        };
    }

    private createSetHandler(
        path: string,
        proxiedChildren: Set<BaseObject>
    ): ProxyHandler<Set<any>> {
        // For patch purposes treat Sets like Maps, use the values as keys and always use "1" as the pretend value.
        return {
            get: (target, field) => {
                let func;

                if (field === 'add') {
                    func = (val: any) => {
                        target.add(val);

                        if (this.isAllowedMapKey(val)) {
                            this.setField(path, val, 1, 1, proxiedChildren);
                        }

                        return this;
                    };
                } else if (field === 'delete') {
                    func = (key: any) => {
                        target.delete(key);

                        if (this.isAllowedMapKey(key)) {
                            this.deleteField(path, field, 1, proxiedChildren);
                        }

                        return this;
                    };
                } else if (field === 'clear') {
                    func = () => {
                        target.clear();
                        // TODO: generate patch
                    };
                } else {
                    let val = (target as any)[field];

                    if (typeof val === 'function') {
                        val = val.bind(target);
                    }

                    return val;
                }

                return func.bind(target);
            },
        };
    }

    public createProxy(underlying: BaseObject, path: string) {
        const proxiedChildren = new Set<BaseObject>();

        let handler;
        if (isArray(underlying)) {
            handler = this.createArrayHandler(path, proxiedChildren);
        } else if (isMap(underlying)) {
            handler = this.createMapHandler(path, proxiedChildren);
        } else if (isSet(underlying)) {
            handler = this.createSetHandler(path, proxiedChildren);
        } else {
            handler = this.createObjectHandler(path, proxiedChildren);
        }

        const proxy: BaseObject = new Proxy(underlying, handler);

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
