import { isArray, isMap, isSet } from 'enhancejson/lib/typeChecks';
import type { Operation, Path } from './Operation';
import { OperationType } from './OperationType';

interface BaseObject {}

interface ProxyInfo {
    path: Path;
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
        path: Path,
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

            const childPath = path ? [...path, field] : [field];

            return this.createProxy(val, childPath);
        }

        return val;
    }

    private setField(
        path: Path,
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
        path: Path,
        field: string,
        val: any,
        proxiedChildren: Set<BaseObject>
    ) {
        proxiedChildren.delete(val);
        this.removeProxy(val);

        this.patchCallback(this.createDeleteOperation(path, field));
    }

    private clearAllFields(path: Path, proxiedChildren: Set<BaseObject>) {
        for (const val of proxiedChildren) {
            this.removeProxy(val);
        }
        proxiedChildren.clear();

        this.patchCallback(this.createClearOperation(path));
    }

    private createObjectHandler(
        path: Path,
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
        path: Path,
        proxiedChildren: Set<BaseObject>
    ): ProxyHandler<any[]> {
        return {
            get: (target, field) => {
                let val = (target as any)[field];

                if (field === 'splice') {
                    return (
                        start: number,
                        deleteCount: number,
                        ...items: any[]
                    ) => {
                        for (let i = start; i < start + deleteCount; i++) {
                            const removing = target[i];
                            proxiedChildren.delete(removing);
                            this.removeProxy(removing);
                        }

                        this.patchCallback(
                            this.createSpliceOperation(
                                path,
                                start,
                                deleteCount,
                                items
                            )
                        );

                        return target.splice(start, deleteCount, ...items);
                    };
                } else if (field === 'shift') {
                    return () => {
                        this.patchCallback(this.createShiftOperation(path));

                        const shifted = target.shift();

                        proxiedChildren.delete(shifted);
                        this.removeProxy(shifted);

                        return shifted;
                    };
                } else if (field === 'unshift') {
                    return (...items: any[]) => {
                        this.patchCallback(
                            this.createUnshiftOperation(path, items)
                        );

                        return target.unshift(...items);
                    };
                } else if (field === 'reverse') {
                    return () => {
                        this.patchCallback(this.createReverseOperation(path));

                        return target.reverse();
                    };
                }

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
        path: Path,
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
                                key,
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
                            this.deleteField(path, key, val, proxiedChildren);
                        }

                        return this;
                    };
                } else if (field === 'clear') {
                    func = () => {
                        target.clear();
                        this.clearAllFields(path, proxiedChildren);
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
        path: Path,
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
                            this.deleteField(path, key, 1, proxiedChildren);
                        }

                        return this;
                    };
                } else if (field === 'clear') {
                    func = () => {
                        target.clear();
                        this.clearAllFields(path, proxiedChildren);
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

    public createProxy<T extends BaseObject>(underlying: T, path: Path) {
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

        const proxy = new Proxy(underlying, handler) as T;

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

        return (
            !!object && typeof object === 'object' && !(object instanceof Date)
        );
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
        path: Path,
        field: string,
        val: any
    ): Operation {
        return {
            p: path,
            o: OperationType.Set,
            v: [[field, val]],
        };
    }

    private createDeleteOperation(path: Path, field: string): Operation {
        return {
            p: path,
            o: OperationType.Delete,
            k: [field],
        };
    }

    private createClearOperation(path: Path): Operation {
        return {
            p: path,
            o: OperationType.Clear,
        };
    }

    private createSpliceOperation(
        path: Path,
        start: number,
        deleteCount: number,
        items: any[]
    ): Operation {
        return {
            p: path,
            o: OperationType.ArraySplice,
            v: [start, deleteCount, items],
        };
    }

    private createShiftOperation(path: Path): Operation {
        return {
            p: path,
            o: OperationType.ArrayShift,
        };
    }

    private createUnshiftOperation(path: Path, items: any[]): Operation {
        return {
            p: path,
            o: OperationType.ArrayUnshift,
            v: items,
        };
    }

    private createReverseOperation(path: Path): Operation {
        return {
            p: path,
            o: OperationType.ArrayReverse,
        };
    }
}
