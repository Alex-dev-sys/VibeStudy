'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-red-500 font-mono">
            <div className="w-full max-w-2xl space-y-8 text-center">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                    {'> System Failure'}
                </h1>

                <div className="text-xl md:text-2xl text-red-500/80 space-y-2">
                    <p>{'> Critical error detected.'}</p>
                    <p>{`> Code: ${error.digest || 'UNKNOWN_ERROR'}`}</p>
                    <p>{'> Attempting system recovery...'}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                    <button
                        onClick={() => reset()}
                        className="group relative overflow-hidden bg-red-500/10 border border-red-500/50 px-8 py-3 text-lg font-bold text-red-500 transition-all hover:bg-red-500 hover:text-black"
                    >
                        <span className="relative z-10">{'> EXECUTE: RETRY'}</span>
                    </button>

                    <Link href="/">
                        <button className="group relative overflow-hidden bg-white/5 border border-white/20 px-8 py-3 text-lg font-bold text-white/50 transition-all hover:bg-white/10 hover:text-white">
                            <span className="relative z-10">{'> RETURN: HOME'}</span>
                        </button>
                    </Link>
                </div>

                <div className="fixed bottom-4 right-4 text-xs text-red-500/30">
                    SYSTEM_STATUS: CRITICAL
                </div>
            </div>
        </div>
    );
}
