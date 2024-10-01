export type Interface<T> = { [k in keyof T]: T[k] }
export type Prettify<T> = { [k in keyof T]: T[k] } & {}
