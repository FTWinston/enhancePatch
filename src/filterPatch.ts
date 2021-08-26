import { Patch } from './Patch';

type FieldSet = ReadonlySet<string | number | symbol>;

function filterObjectKeys(object: object, fields: FieldSet) {
    for (const key of Object.keys(object)) {
        if (!fields.has(key)) {
            Reflect.deleteProperty(object, key);
        }
    }
}

function filterArrayEntries(array: Array<string | number>, fields: FieldSet) {
    for (let i = 0; i<array.length; i++) {
        const val = array[i];
        
        if (!fields.has(val)) {
            array.splice(i, 1);
            i--;
        }
    }
}

function filterSubArrayEntries(array: Array<[string | number, any]>, fields: FieldSet) {
    for (let i = 0; i<array.length; i++) {
        const [key] = array[i];
        
        if (!fields.has(key)) {
            array.splice(i, 1);
            i--;
        }
    }
}

export function filterPatch(patch: Patch, fields: FieldSet) {
    const anyPatch = patch as any;

    if (anyPatch.s) {
        if (Array.isArray(anyPatch.s)) {
            filterSubArrayEntries(anyPatch.s, fields);
        }
        else {
            filterObjectKeys(anyPatch.s, fields);
        }
    }

    if (anyPatch.c) {
        filterObjectKeys(anyPatch.c, fields);
    }

    if (anyPatch.C) {
        filterObjectKeys(anyPatch.C, fields);
    }

    if (anyPatch.d && Array.isArray(anyPatch.d)) {
        filterArrayEntries(anyPatch.d, fields);
    }
    
    if (anyPatch.a && Array.isArray(anyPatch.a)) {
        filterArrayEntries(anyPatch.a, fields);
    }
}
