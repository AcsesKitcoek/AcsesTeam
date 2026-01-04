import { create } from 'zustand';

/**
 * A global state manager for the loader.
 * This helps differentiate between the initial asset download and
 * subsequent fast parses that happen on navigation.
 */
const useLoaderStore = create((set) => ({
  isInitialLoadComplete: false,
  setInitialLoadComplete: () => set({ isInitialLoadComplete: true }),
}));

export default useLoaderStore;
