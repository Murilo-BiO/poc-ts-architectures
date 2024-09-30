export type Interface<T> = { [k in keyof T]: T[k] }
