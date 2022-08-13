export type ValuesOfEnum<T extends string | number> = `${T}`;
export type MixedValuesOfEnum<T extends string | number> = T | `${T}`;
