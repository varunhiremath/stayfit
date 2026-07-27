import { useEffect } from 'react';
import useUserStore from '../store/userStore.js';

// Initialises and returns the user profile (identity + streak).
export function useProfile() {
  const { profile, loaded, init } = useUserStore();
  useEffect(() => { init(); }, [init]);
  return { profile, loaded };
}
