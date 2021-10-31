// not copied from anywhere, maybe there is already a library which does the same thing :-?
export function createAbortable<TResponse>(
  f: (signal: AbortSignal) => Promise<TResponse>,
  catchAbortError?: boolean
): () => Promise<TResponse>;
export function createAbortable<T1, TResponse>(
  f: (signal: AbortSignal, t1: T1) => Promise<TResponse>,
  catchAbortError?: boolean
): (t1: T1) => Promise<TResponse>;
export function createAbortable<T1, T2, TResponse>(
  f: (signal: AbortSignal, t1: T1, t2: T2) => Promise<TResponse>,
  catchAbortError?: boolean
): (t1: T1, t2: T2) => Promise<TResponse>;
export function createAbortable<T1, T2, T3, TResponse>(
  f: (signal: AbortSignal, t1: T1, t2: T2, t3: T3) => Promise<TResponse>,
  catchAbortError?: boolean
): (t1: T1, t2: T2, t3: T3) => Promise<TResponse>;
export function createAbortable<TResponse>(
  f: (signal: AbortSignal, ...params: any[]) => Promise<TResponse>,
  catchAbortError: boolean = false
): () => Promise<TResponse> {
  let controller = new AbortController();

  return async (...params: any[]) => {
    controller.abort();

    controller = new AbortController();
    if (!catchAbortError) {
      return await f(controller.signal, ...params);
    } else {
      try {
        return await f(controller.signal, ...params);
      } catch (err) {
        if (err?.code !== DOMException.ABORT_ERR) {
          throw err;
        }
      }
    }
  };
}
