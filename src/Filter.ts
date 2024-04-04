export type FilterKey = string | number;

export type ConditionalFilter = {
    include: boolean | ((key: FilterKey) => boolean);
    filter?: Filter;
};

export type Filter = {
    fixedKeys?: Map<FilterKey, ConditionalFilter>;
    otherKeys?: ConditionalFilter;
};

export const unfilteredFilter: ConditionalFilter = {
    include: true,
};
