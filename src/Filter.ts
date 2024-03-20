type FilterKey = string | number;

export type FieldFilterValue = boolean | Filter | ((key: FilterKey) => boolean | Filter);

export type SpecificKeyFilters = Map<FilterKey, FieldFilterValue>;

export type Filter = {
    fixedKeys?: SpecificKeyFilters;
    otherKeys?: FieldFilterValue;
}

// TODO: The edge case of the FieldFilterValue function changing from returning boolean to a Filter is a bit crappy.
// Possibly can't avoid the problems of that scenario by having the function return true and ALSO having a (fixed) filter,
// cos a field's function can still switch from true to false, or vice versa.
// (Or perhaps that simpler scenario is manageable in isolation, but we don't want to have to REMEMBER whether a previous value was filtered or not.)