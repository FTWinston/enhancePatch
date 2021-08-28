import { Patch } from './Patch';

export function appendPatch(master: Patch, addition: Patch) {
    const anyMaster = master as any;
    const anyAddition = addition as any;

    if (anyAddition.s) {

        // TODO: remove corresponding entries from master.d
    }

    if (anyAddition.d) {
        if (anyMaster.d === undefined) {
            anyMaster.d = anyAddition.d
        }
        else if (Array.isArray(anyAddition.d)) {
            if (anyMaster.d !== true) {
                anyMaster.d.splice(anyMaster.d.length, 0, ...anyAddition.d);
            }
        }
        else {
            anyMaster.d = true;
        }

        // TODO: remove corresponding entries from master.s
    }

    // TODO: C and c

    // TODO: a

    // TODO: arrayPatch o and c stuff ... this feels like reinventing the wheel.

    // TODO: if addition modifies a child, and that child is actually set on master,
    // shouldn't modify the child any more, right? Possibly it's OK tho...
}
