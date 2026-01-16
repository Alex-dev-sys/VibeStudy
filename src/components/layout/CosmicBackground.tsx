'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCosmicTheme } from '@/store/cosmic-theme-store';

export function CosmicBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const theme = useCosmicTheme((state) => state.theme);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let stars: { x: number; y: number; size: number; opacity: number; speed: number }[] = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initStars();
        };

        const initStars = () => {
            const starCount = Math.floor((window.innerWidth * window.innerHeight) / 3000);
            stars = [];
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1.5,
                    opacity: Math.random(),
                    speed: Math.random() * 0.05 + 0.01,
                });
            }
        };

        const drawStars = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw stars
            stars.forEach((star) => {
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();

                // Twinkle effect
                star.opacity += (Math.random() - 0.5) * 0.02;
                if (star.opacity < 0.1) star.opacity = 0.1;
                if (star.opacity > 0.8) star.opacity = 0.8;

                // Subtle movement
                star.y -= star.speed;
                if (star.y < 0) star.y = canvas.height;
            });

            animationFrameId = requestAnimationFrame(drawStars);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        drawStars();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
            {/* Deep Space Base */}
            <div className="absolute inset-0 bg-[#0a0a0a]" />

            <AnimatePresence mode="wait">
                {theme === 'black' ? (
                    <motion.div
                        key="black-theme"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        {/* Black Theme: Purple/Blue Cosmic Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0b2e]/40 via-[#0a0a0a]/80 to-[#0a0a0a]" />

                        {/* Colorful Nebulas - Subtle touches */}
                        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
                        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-pink-900/10 blur-[100px]" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="red-theme"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        {/* Red Theme: Pink/Red/Orange Nebulas */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#2e0b1a]/40 via-[#0a0a0a]/80 to-[#0a0a0a]" />

                        {/* Animated orbs - Red theme */}
                        <motion.div
                            className="absolute left-[-22%] top-[-12%] h-[420px] w-[420px] bg-[rgba(255,0,148,0.38)] rounded-full blur-3xl"
                            animate={{ scale: [1, 1.12, 1] }}
                            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
                        />
                        <motion.div
                            className="absolute right-[-18%] top-[28%] h-[520px] w-[520px] bg-[rgba(255,218,0,0.28)] rounded-full blur-3xl"
                            animate={{ scale: [1, 1.12, 1] }}
                            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
                        />
                        <motion.div
                            className="absolute left-[30%] bottom-[-25%] h-[480px] w-[480px] bg-[rgba(255,118,240,0.32)] rounded-full blur-3xl"
                            animate={{ scale: [1, 1.12, 1] }}
                            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stars Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full opacity-60"
            />

            {/* Grain Overlay for Texture */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] mix-blend-overlay" />
        </div>
    );
}
