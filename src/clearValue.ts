import { isArray, isMap, isObject, isSet } from 'enhancejson/lib/typeChecks';

export function clearValue(element: any) {
    if (isArray(element)) {
        element.splice(0, element.length);
    } else if (isMap(element)) {
        element.clear();
    } else if (isSet(element)) {
        element.clear();
    } else if (isObject(element)) {
        for (const key in element) {
            delete element[key];
        }
    }
}
