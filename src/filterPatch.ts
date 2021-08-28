import { ArrayPatch, MapPatch, ObjectPatch, Patch, SetPatch } from './Patch';

type FieldSet = ReadonlySet<string | number>;

function filterObjectKeys(object: object, fields: FieldSet) {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(object)) {
        if (fields.has(key)) {
            result[key] = value;
        }
    }

    return result;
}

function filterNumericObjectKeys(object: object, fields: FieldSet) {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(object)) {
        const numKey = parseFloat(key);
        if (fields.has(numKey)) {
            result[key] = value;
        }
    }

    return result;
}

function filterArrayEntries(array: Array<string | number>, fields: FieldSet) {
    const result: Array<string | number> = [];

    for (let i = 0; i < array.length; i++) {
        const val = array[i];

        if (fields.has(val)) {
            result.push(val);
        }
    }

    return result;
}

function filterSubArrayEntries(
    array: Array<[string | number, any]>,
    fields: FieldSet
) {
    const result: Array<[string | number, any]> = [];

    for (let i = 0; i < array.length; i++) {
        const entry = array[i];

        if (fields.has(entry[0])) {
            result.push(entry);
        }
    }

    return result;
}

type PatchKey =
    | keyof ObjectPatch
    | keyof ArrayPatch
    | keyof MapPatch
    | keyof SetPatch;

export function filterPatch(patch: Patch, fields: FieldSet): Patch {
    const sourcePatch: Partial<Record<PatchKey, any>> = patch;
    const resultPatch: Partial<Record<PatchKey, any>> = {};

    if (sourcePatch.s) {
        if (Array.isArray(sourcePatch.s)) {
            resultPatch.s = filterSubArrayEntries(sourcePatch.s, fields);
        } else {
            resultPatch.s = filterObjectKeys(sourcePatch.s, fields);
        }
    }

    if (sourcePatch.c) {
        resultPatch.c = filterObjectKeys(sourcePatch.c, fields);
    }

    if (sourcePatch.C) {
        resultPatch.C = filterNumericObjectKeys(sourcePatch.C, fields);
    }

    if (sourcePatch.d) {
        if (Array.isArray(sourcePatch.d)) {
            resultPatch.d = filterArrayEntries(sourcePatch.d, fields);
        } else {
            resultPatch.d = sourcePatch.d;
        }
    }

    if (sourcePatch.a) {
        resultPatch.a = filterArrayEntries(sourcePatch.a, fields);
    }

    if (sourcePatch.o) {
        resultPatch.o = sourcePatch.o;
    }

    return resultPatch;
}
