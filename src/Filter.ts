type FilterKey = string | number;

type FieldFilterValue = {
  include: boolean | ((key: FilterKey) => boolean;
  filter?: Filter;
}

export type Filter = {
    fixedKeys?: Map<FilterKey, FieldFilterValue>;
    otherKeys?: FieldFilterValue;
}
