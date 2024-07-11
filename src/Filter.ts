/** key or index to match in corresponding Object/Map/Set or Array */
export type FilterKey = string | number;

type Conditional = {
    /** A boolean indicating whether this object should be included in filtered output, or a function that returns a boolean, which will be recalculated when `updateConditionalIncludes` is called */
    include?: (key: FilterKey) => boolean;
};

type FixedFieldFilter = {
    /** Filtering to apply to specific Object/Map/Set keys, or array indexes */
    fixedKeys: Partial<Record<FilterKey, ConditionalFilter | true>>;
};

type AnyFieldFilter = {
    /** Filtering to apply to any Object/Map/Set keys, or array indexes which aren't specified in `fixedKeys` */
    otherKeys: ConditionalFilter | true;
}

/** A filter to apply when recording a patch, to limit what is included in generated patch output */
export type Filter = FixedFieldFilter | AnyFieldFilter

/** A nested filter, to be applied to a particular object within an already-filtered Object, Array or Map */
export type ConditionalFilter = Filter & Conditional;
