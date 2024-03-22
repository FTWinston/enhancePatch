# Megapatch

Record changes to an object tree into an efficient json "patch" object, and use this to apply the recorded changes to a different object tree.

![Version badge](https://badgen.net/npm/v/megapatch) ![Minified badge](https://badgen.net/bundlephobia/min/megapatch) ![Minzipped badge](https://badgen.net/bundlephobia/minzip/megapatch) ![Dependencies badge](https://badgen.net/bundlephobia/dependency-count/megapatch) ![Types badge](https://badgen.net/npm/types/megapatch) [![NodeJS CI](https://github.com/FTWinston/megapatch/actions/workflows/test.yml/badge.svg?event=push)](https://github.com/FTWinston/megapatch/actions/workflows/test.yml)

When making many changes to a complex object tree, json patch is a fairly inefficient way of recording those changes.
Instead of one patch object per operation, megapatch groups any number of operations into a single "patch" object.
This smartly handles repeated updates of the same object, and array manipulation, to keep the "patch" as small as possible.

## Installation
Run `npm install --save megapatch`

## Usage

Megapatch can record and recreate changes to javascript objects, arrays, Maps and Sets. It cannot recreate classes.

```javascript
import { startRecordingPatch, finishRecordingPatch, applyPatch } from 'megapatch';

const data = { existing: [1, 2, 3] };

// The proxy appears identical to the source data.
const proxy = startRecordingPatch(data); 

// All changes should be made via the proxy.
proxy.foo = 1;
proxy.bar = '2';
proxy.existing.push(4);
proxy.someArray = [3, 4];
proxy.someArray.splice(1, 0, 'a', 'b');
proxy.someMap = new Map([[1, 'a'], [2, 'b']]);
proxy.someMap.set(3, 'c');

// Changes made via the proxy update the underlying data.
expect(proxy).toEqual(data);

// Retrieve a "patch" representing all of the recorded changes.
const patch = finishRecordingPatch(proxy);

expect(typeof patch).toEqual('string');

// This is identical to the original data object, before the changes were recorded.
const newData = { existing: [1, 2, 3] };

// Applying a patch  doesn't mutate the existing objects.
const updatedData = applyPatch(newData, patch);

expect(updatedData).toEqual(data);
expect(updatedData).not.toEqual(newData);
```

Megapatch uses [enhanceJSON](https://github.com/FTWinston/enhanceJSON) to stringify and parse JSON.

## Patch structure
_Note that knowledge of the patch structure is not required to use megapatch to record or apply patches. This section is included for information only._

Each patch is an object. There are 4 patch types, depending on the target of the patch.

A patch is always applied to an existing object, array, Map or Set. It is not always possible to determine the type of the target from a patch, e.g. a certain `ObjectPatch` might be insdistinguishable from a `MapPatch`.

### ObjectPatch
This represents a patch to be applied to an existing object. Note that the keys of a javascript object are always stored as strings, even if they were specified numerically.

It has any of the following properties:
- *s*: an object, whose keys are strings representing properties to be set on the patched object, and whose values are the corresponding values.
- *d*: an array of strings, representing properties to be deleted from the patched object.
- *c*: an object, whose keys are strings representing existing properties on the patched object, and whose values are patches to be applied to the corresponding child object.

### ArrayPatch
This represents a patch to be applied to an existing array. It has any of the following properties:
- *o*: an array of objects, each representing an operation to be applied to the patched array, such as setting an item, shifting an item from the start of the array, or splicing items into/out of the array.
- *c*: an object, whose keys are strings representing existing indexes in the patched array, and whose values are patches to be applied to the corresponding child object.

### MapPatch
This represents a patch to be applied to an existing Map. Megapatch requires that Maps use only strings and numbers as their keys. (Objects couldn't later be referred to via a string representation of the object.)

It has any of the following properties:
- *s*: an array representing values to be added to the patched Map. Each entry is itself an array of two items, with the first being a string or number being the entry's key, and the second being the entry's value.
- *d*: an array of strings or numbers, representing keys to be deleted from the patched Map, _or_ true, to clear the patched Map completely.
- *c*: an object, whose keys are strings representing existing _string_ keys on the patched Map, and whose values are patches to be applied to the corresponding value object.
- *C*: an object, whose keys are strings representing existing _number_ keys on the patched Map, and whose values are patches to be applied to the corresponding value object.

### SetPatch
This represents a patch to be applied to an existing Set. Megapatch requires that Sets contain only strings and numbers. (Objects couldn't later be referred to via a string representation of the object.)

It has any of the following properties:
- *a*: an array of strings or numbers, representing values to be added to the patched Set.
- *d*: an array of strings or numbers, representing values to be deleted from the patched Set, _or_ true, to clear the patched Set completely.
