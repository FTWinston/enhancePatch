import { Patch } from './Patch';
import { isSet } from './typeChecks';

/**
 * Merge a newer patch into an older one, updating it so that it contains all changes from both patches.
 * @param target The older patch, which will be updated with the addition.
 * @param addition The newer patch, which will be merged into the target.
 */
export function appendPatch(target: Patch, addition: Patch) {
    if ('d' in addition && addition.d !== undefined) {
        if (isSet(addition.d)) {
            // Add to target.d, and remove corresponding keys from target.s
            if ('d' in target && isSet(target.d)) {
                for (const key of addition.d) {
                    target.d.add(key as string); // key could be MapKey or string, but needs the type assertion here because appendPatch is agnostic as to which type of patch is being appended, as long as both patches are the same type.
                }
            }

            if ('s' in target && target.s !== undefined) {
                for (const key of addition.d) {
                    target.s.delete(key as string); // key could be MapKey or string, but needs the type assertion here because appendPatch is agnostic as to which type of patch is being appended, as long as both patches are the same type.
                }
            }
            else if ('a' in target && target.a !== undefined) {
                for (const key of addition.d) {
                    target.a.delete(key);
                }
            }
        }
        else {
            // As addition.d is true, make target.d true, and clear target.s.
            (target as any).d = true;

            if ('s' in target && target.s !== undefined) {
                target.s.clear();
            }
            else if ('a' in target && target.a !== undefined) {
                target.a.clear();
            }
        }
    }

    if ('s' in addition && addition.s !== undefined) {
        // Add to target.s, and remove corresponding keys from target.d
        if ('s' in target && target.s !== undefined) {
            for (const [key, value] of addition.s) {
                target.s.set(key as string, value); // key could be MapKey or string, but needs the type assertion here because appendPatch is agnostic as to which type of patch is being appended, as long as both patches are the same type.
            }
        }

        if ('d' in target && isSet(target.d)) {
            for (const [key] of addition.s) {
                target.d.delete(key as string); // key could be MapKey or string, but needs the type assertion here because appendPatch is agnostic as to which type of patch is being appended, as long as both patches are the same type.
            }       
        }
    }
    else if ('a' in addition && addition.a !== undefined) {
        // Add to target.a, and remove corresponding keys from target.d
        if ('a' in target && target.a !== undefined) {
            for (const key of addition.a) {
                target.a.add(key);
            }
        }

        if ('d' in target && isSet(target.d)) {
            for (const key of addition.a) {
                target.d.delete(key as string); // key could be MapKey or string, but needs the type assertion here because appendPatch is agnostic as to which type of patch is being appended, as long as both patches are the same type.
            }       
        }
    }

    // TODO: c ... and also how that interacts with s & d

    // TODO: arrayPatch o and c stuff ... this feels like reinventing the wheel.

    // TODO: if addition modifies a child, and that child is actually set on target,
    // shouldn't modify the child any more, right? Should just update it on target instead?
}
