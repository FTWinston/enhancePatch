import { arrayIndex } from './arrayIndex';
import { isArray, isMap, isObject, isSet } from 'enhancejson/lib/typeChecks';

export function setValue(element: any, key: string | number, value: any) {
    if (isArray(element)) {
        element.splice(arrayIndex(key), 1, value);
    } else if (isMap(element)) {
        element.set(key, value);
    } else if (isSet(element)) {
        element.add(key);
    } else if (isObject(element)) {
        element[key] = value;
    }
}
