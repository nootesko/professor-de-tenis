// Bridge between repositories and the Zustand store.
// The store sets these accessors on init, allowing repos to read/write
// state without importing the store directly (avoids circular deps).

type AnyState = Record<string, unknown>;

let _get: (() => AnyState) | null = null;
let _set: ((updater: AnyState | ((prev: AnyState) => AnyState)) => void) | null = null;

export function bindStore(
  getter: () => AnyState,
  setter: (updater: AnyState | ((prev: AnyState) => AnyState)) => void,
): void {
  _get = getter;
  _set = setter;
}

export function getState<T = AnyState>(): T {
  if (!_get) throw new Error('Store not bound');
  return _get() as T;
}

export function setState(updater: AnyState | ((prev: AnyState) => AnyState)): void {
  if (!_set) throw new Error('Store not bound');
  _set(updater);
}

// Test helper: replace top-level state slices (preserves action functions
// because we merge over current state).
export function resetState(slice: AnyState): void {
  if (!_set || !_get) throw new Error('Store not bound');
  const current = _get();
  _set({ ...current, ...slice });
}
