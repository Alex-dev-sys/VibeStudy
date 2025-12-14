'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
    const [text, setText] = useState('');
    const fullText = '> Error 404: Page not found...';
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 530);
        return () => clearInterval(cursorInterval);
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-green-500 font-mono">
            <div className="w-full max-w-2xl space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                        {text}
                        <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>_</span>
                    </h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3.5, duration: 1 }}
                        className="text-xl md:text-2xl text-green-500/80"
                    >
                        <p>{'> System malfunction detected.'}</p>
                        <p>{'> The requested resource is unavailable.'}</p>
                        <p>{'> Please return to base.'}</p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 4.5, duration: 0.5 }}
                >
                    <Link href="/">
                        <button className="group relative overflow-hidden bg-green-500/10 border border-green-500/50 px-8 py-3 text-lg font-bold text-green-500 transition-all hover:bg-green-500 hover:text-black">
                            <span className="relative z-10">{'> EXECUTE: RETURN_HOME'}</span>
                        </button>
                    </Link>
                </motion.div>

                <div className="fixed bottom-4 right-4 text-xs text-green-500/30">
                    SYSTEM_ID: VIBE_STUDY_OS_V2.0
                </div>
            </div>
        </div>
    );
}
