export type FilterKey = string | number;

type Conditional = {
    include?: (key: FilterKey) => boolean;
};

type FixedFieldFilter = {
    fixedKeys: Partial<Record<FilterKey, ConditionalFilter | true>>;
};

type AnyFieldFilter = {
    otherKeys: ConditionalFilter | true;
}

export type Filter = FixedFieldFilter | AnyFieldFilter

export type ConditionalFilter = Filter & Conditional;
