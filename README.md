# enhancePatch

Record changes to an object tree into an efficient json "patch" object, and use this to apply the recorded changes to a different object tree.

json patch is an inefficient way of representing a large number of changes to a complex object tree.
Instead of one patch object per operation, enhancepatch groups any number of operations into a single "patch" object.
This smartly handles array manipulation, to keep the "patch" as small as possible.

## Installation
Run `npm install --save enhancepatch`

## Usage

enhancePatch can record and recreate changes to javascript objects, arrays, Maps and Sets. It cannot recreate classes.

```javascript
import { recordChanges, finishRecording, applyChanges } from 'enhancepatch';

const data = { existing: [1, 2, 3] };

// The proxy appears identical to the source data.
const proxy = recordChanges(data); 

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
const patch = finishRecording(proxy);

expect(typeof patch).toEqual('string');

// This is identical to hte original data object, before the changes were recorded.
const newData = { existing: [1, 2, 3] };

// Applying changes doesn't mutate existing objects.
const updatedData = applyChanges(newData, patch);

expect(updatedData).toEqual(data);
expect(updatedData).not.toEqual(newData);
```
