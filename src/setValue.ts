import { isNumber } from './typeChecks';
import { isArray, isMap, isObject, isSet } from 'enhancejson/lib/typeChecks';

export function setValue(element: any, key: string | number, value: any) {
    if (isArray(element)) {
        if (!isNumber(key)) {
            throw new Error('Array key must be a positive integer');
        }
        element.splice(key, 1, value);
    } else if (isMap(element)) {
        element.set(key, value);
    } else if (isSet(element)) {
        element.add(key);
    } else if (isObject(element)) {
        element[key] = value;
    }
}
