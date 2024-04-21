export type FilterKey = string | number;

type Conditional = {
    include?: (key: FilterKey) => boolean;
};

export type Filter = {
    fixedKeys?: Partial<Record<FilterKey, ConditionalFilter | true>>;
    otherKeys?: ConditionalFilter;
};

export type ConditionalFilter = Filter & Conditional;
