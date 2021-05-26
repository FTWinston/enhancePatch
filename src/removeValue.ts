import { isNumber } from './typeChecks';
import { isArray, isMap, isObject, isSet } from 'enhancejson/lib/typeChecks';

export function removeValue(element: any, key: string | number) {
    if (isArray(element)) {
        if (!isNumber(key)) {
            throw new Error('Array key must be a positive integer');
        }
        element.splice(key, 1);
    } else if (isMap(element)) {
        element.delete(key);
    } else if (isSet(element)) {
        element.delete(key);
    } else if (isObject(element)) {
        delete element[key];
    }
}
