import { clone } from './clone';
import { isIndexString } from './typeChecks';
import { isArray, isMap, isObject } from 'enhancejson/lib/typeChecks';

function reallocateSegment(target: any, key: string) {
    if (isArray(target)) {
        if (!isIndexString(key)) {
            throw new Error('Array key must be a positive integer');
        }

        const index = parseInt(key, 10);

        if (target.length <= index) {
            throw new Error('Index is greater than length of array');
        }

        const value = clone(target[index]);
        target[index] = value;
        return value;
    } else if (isMap(target)) {
        if (!target.has(key)) {
            throw new Error('Key not present in Map');
        }

        const value = clone(target.get(key));
        target.set(key, value);
        return value;
    } else if (isObject(target)) {
        if (!target.hasOwnProperty(key)) {
            throw new Error('Key not present in object');
        }

        const value = clone(target[key]);
        target[key] = value;
        return value;
    } else {
        return target;
    }
}

export function reallocate(tree: any, segments: string[]): [any, any] {
    tree = clone(tree);

    let target = tree;

    for (const segment of segments) {
        target = reallocateSegment(target, segment);
    }

    return [tree, target];
}
