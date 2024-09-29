import { Option, some } from "./option";

type Fn<Params, Return> = (arg: Params) => Return

function pipe<T>(val: T): T
function pipe<T, A>(val: T, ...fns: [Fn<T, A>]): A
function pipe<T, A, B>(val: T, ...fns: [Fn<T, A>, Fn<A, B>]): B
function pipe<T, A, B, C>(val: T, ...fns: [Fn<T, A>, Fn<A, B>, Fn<B, C>]): C
function pipe<T, A, B, C, D>(val: T, ...fns: [Fn<T, A>, Fn<A, B>, Fn<B, C>, Fn<C, D>]): D
function pipe<T, A, B, C, D, E>(val: T, ...fns: [Fn<T, A>, Fn<A, B>, Fn<B, C>, Fn<C, D>, Fn<D, E>]): E
function pipe<T, A, B, C, D, E, F>(val: T, ...fns: [Fn<T, A>, Fn<A, B>, Fn<B, C>, Fn<C, D>, Fn<D, E>, Fn<E, F>]): F
function pipe<T, A, B, C, D, E, F, G>(val: T, ...fns: [Fn<T, A>, Fn<A, B>, Fn<B, C>, Fn<C, D>, Fn<D, E>, Fn<E, F>, Fn<F, G>]): G
function pipe<T, A, B, C, D, E, F, G, H>(val: T, ...fns: [Fn<T, A>, Fn<A, B>, Fn<B, C>, Fn<C, D>, Fn<D, E>, Fn<E, F>, Fn<F, G>, Fn<G, H>]): H
function pipe<T, A, B, C, D, E, F, G, H, I>(val: T, ...fns: [Fn<T, A>, Fn<A, B>, Fn<B, C>, Fn<C, D>, Fn<D, E>, Fn<E, F>, Fn<F, G>, Fn<G, H>, Fn<H, I>]): I
function pipe<T, A, B, C, D, E, F, G, H, I, J>(val: T, ...fns: [Fn<T, A>, Fn<A, B>, Fn<B, C>, Fn<C, D>, Fn<D, E>, Fn<E, F>, Fn<F, G>, Fn<G, H>, Fn<H, I>, Fn<I, J>]): J
function pipe<T, A, B, C, D, E, F, G, H, I, J, K>(val: T, ...fns: [Fn<T, A>, Fn<A, B>, Fn<B, C>, Fn<C, D>, Fn<D, E>, Fn<E, F>, Fn<F, G>, Fn<G, H>, Fn<H, I>, Fn<I, J>, Fn<J, K>]): K
function pipe<T, A, B, C, D, E, F, G, H, I, J, K, L>(val: T, ...fns: [Fn<T, A>, Fn<A, B>, Fn<B, C>, Fn<C, D>, Fn<D, E>, Fn<E, F>, Fn<F, G>, Fn<G, H>, Fn<H, I>, Fn<I, J>, Fn<J, K>, Fn<K, L>]): L
function pipe<T, A, B, C, D, E, F, G, H, I, J, K, L, M>(val: T, ...fns: [Fn<T, A>, Fn<A, B>, Fn<B, C>, Fn<C, D>, Fn<D, E>, Fn<E, F>, Fn<F, G>, Fn<G, H>, Fn<H, I>, Fn<I, J>, Fn<J, K>, Fn<K, L>, Fn<L, M>]): M
function pipe<T, A, B, C, D, E, F, G, H, I, J, K, L, M, N>(val: T, ...fns: [Fn<T, A>, Fn<A, B>, Fn<B, C>, Fn<C, D>, Fn<D, E>, Fn<E, F>, Fn<F, G>, Fn<G, H>, Fn<H, I>, Fn<I, J>, Fn<J, K>, Fn<K, L>, Fn<L, M>, Fn<M, N>]): N
function pipe<T, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(val: T, ...fns: [Fn<T, A>, Fn<A, B>, Fn<B, C>, Fn<C, D>, Fn<D, E>, Fn<E, F>, Fn<F, G>, Fn<G, H>, Fn<H, I>, Fn<I, J>, Fn<J, K>, Fn<K, L>, Fn<L, M>, Fn<M, N>, Fn<N, O>]): O
function pipe<T, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(val: T, ...fns: [Fn<T, A>, Fn<A, B>, Fn<B, C>, Fn<C, D>, Fn<D, E>, Fn<E, F>, Fn<F, G>, Fn<G, H>, Fn<H, I>, Fn<I, J>, Fn<J, K>, Fn<K, L>, Fn<L, M>, Fn<M, N>, Fn<N, O>, Fn<O, P>]): P
function pipe<T, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(val: T, ...fns: [Fn<T, A>, Fn<A, B>, Fn<B, C>, Fn<C, D>, Fn<D, E>, Fn<E, F>, Fn<F, G>, Fn<G, H>, Fn<H, I>, Fn<I, J>, Fn<J, K>, Fn<K, L>, Fn<L, M>, Fn<M, N>, Fn<N, O>, Fn<O, P>, Fn<P, Q>]): Q
function pipe<T, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R>(val: T, ...fns: [Fn<T, A>, Fn<A, B>, Fn<B, C>, Fn<C, D>, Fn<D, E>, Fn<E, F>, Fn<F, G>, Fn<G, H>, Fn<H, I>, Fn<I, J>, Fn<J, K>, Fn<K, L>, Fn<L, M>, Fn<M, N>, Fn<N, O>, Fn<O, P>, Fn<P, Q>, Fn<Q, R>]): R
function pipe<T, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S>(val: T, ...fns: [Fn<T, A>, Fn<A, B>, Fn<B, C>, Fn<C, D>, Fn<D, E>, Fn<E, F>, Fn<F, G>, Fn<G, H>, Fn<H, I>, Fn<I, J>, Fn<J, K>, Fn<K, L>, Fn<L, M>, Fn<M, N>, Fn<N, O>, Fn<O, P>, Fn<P, Q>, Fn<Q, R>, Fn<R, S>]): S
function pipe<T, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, TNext>(val: T, ...fns: [Fn<T, A>, Fn<A, B>, Fn<B, C>, Fn<C, D>, Fn<D, E>, Fn<E, F>, Fn<F, G>, Fn<G, H>, Fn<H, I>, Fn<I, J>, Fn<J, K>, Fn<K, L>, Fn<L, M>, Fn<M, N>, Fn<N, O>, Fn<O, P>, Fn<P, Q>, Fn<Q, R>, Fn<R, S>, Fn<S, TNext>]): TNext

// Generic implementation for pipe
function pipe<T>(val: T, ...fns: Array<(arg: any) => any>): any {
  return fns.reduce((acc, fn) => fn(acc), val);
}

const a = some(123)
pipe(a,
  x => x.map(n => n * 2),
  x => x.map(n => n.toString()),
  s => s.unwrapOr('failed'),
  s => s.length,
   
)