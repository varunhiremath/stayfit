import { create } from 'zustand';
import { db } from '../db/db.js';

const DEFAULT_PROFILE = {
  name: '',
  height: null,
  sex: null,
  birthYear: null,
  streak: 0,
  lastWorkoutDate: null,
  joinDate: new Date().toISOString().slice(0, 10),
};

const useUserStore = create((set, get) => ({
  profile: null,
  loaded: false,

  async init() {
    if (get().loaded) return;
    let profile = await db.userProfile.get(1);
    if (!profile) {
      const id = await db.userProfile.add({ ...DEFAULT_PROFILE });
      profile = await db.userProfile.get(id);
    }
    set({ profile, loaded: true });
  },

  async updateProfile(updates) {
    const profile = { ...get().profile, ...updates };
    await db.userProfile.put({ ...profile, id: 1 });
    set({ profile });
  },
}));

export default useUserStore;
