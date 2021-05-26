import { isArray, isMap, isObject, isSet } from 'enhancejson/lib/typeChecks';

export function clone(o: any) {
    if (isArray(o)) {
        return o.slice();
    } else if (isMap(o)) {
        return new Map(o);
    } else if (isSet(o)) {
        return new Set(o);
    } else if (isObject(o)) {
        return { ...o };
    } else {
        return o;
    }
}
