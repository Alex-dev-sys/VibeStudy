import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CosmicTheme = 'black' | 'red';

interface CosmicThemeState {
    theme: CosmicTheme;
    setTheme: (theme: CosmicTheme) => void;
}

export const useCosmicTheme = create<CosmicThemeState>()(
    persist(
        (set) => ({
            theme: 'black',
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'cosmic-theme-storage',
        }
    )
);
