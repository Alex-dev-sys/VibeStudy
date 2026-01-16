'use client';

import { useCosmicTheme } from '@/store/cosmic-theme-store';

export function CosmicBackground() {
    const theme = useCosmicTheme((state) => state.theme);

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
            {/* Deep Space Base */}
            <div className="absolute inset-0 bg-[#0a0a0a]" />

            {theme === 'black' ? (
                <div className="absolute inset-0">
                    {/* Black Theme: Purple/Blue Cosmic Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1a0b2e]/40 via-[#0a0a0a]/80 to-[#0a0a0a]" />

                    {/* Static Nebulas */}
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
                    <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-pink-900/10 blur-[100px]" />
                </div>
            ) : (
                <div className="absolute inset-0">
                    {/* Red Theme: Pink/Red/Orange Nebulas */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#2e0b1a]/40 via-[#0a0a0a]/80 to-[#0a0a0a]" />

                    {/* Static orbs - Red theme */}
                    <div className="absolute left-[-22%] top-[-12%] h-[420px] w-[420px] bg-[rgba(255,0,148,0.38)] rounded-full blur-3xl" />
                    <div className="absolute right-[-18%] top-[28%] h-[520px] w-[520px] bg-[rgba(255,218,0,0.28)] rounded-full blur-3xl" />
                    <div className="absolute left-[30%] bottom-[-25%] h-[480px] w-[480px] bg-[rgba(255,118,240,0.32)] rounded-full blur-3xl" />
                </div>
            )}

            {/* Static Stars using CSS */}
            <div
                className="absolute inset-0 opacity-40"
                style={{
                    backgroundImage: `
                        radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.8), transparent),
                        radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,0.5), transparent),
                        radial-gradient(1.5px 1.5px at 60% 20%, rgba(255,255,255,0.9), transparent),
                        radial-gradient(1px 1px at 80% 60%, rgba(255,255,255,0.6), transparent),
                        radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.7), transparent),
                        radial-gradient(1.5px 1.5px at 70% 40%, rgba(255,255,255,0.5), transparent),
                        radial-gradient(1px 1px at 30% 90%, rgba(255,255,255,0.6), transparent),
                        radial-gradient(1px 1px at 90% 10%, rgba(255,255,255,0.8), transparent),
                        radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.5), transparent),
                        radial-gradient(1.5px 1.5px at 15% 45%, rgba(255,255,255,0.7), transparent)
                    `,
                    backgroundSize: '200px 200px'
                }}
            />
        </div>
    );
}
