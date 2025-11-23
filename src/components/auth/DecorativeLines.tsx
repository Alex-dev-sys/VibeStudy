'use client';

import { motion } from 'framer-motion';

export function DecorativeLines() {
  return (
    <>
      {/* Left decorative lines */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="pointer-events-none fixed left-0 top-1/4 hidden h-1/2 w-32 md:block"
      >
        <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />
        <div className="absolute left-8 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <div className="absolute left-16 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      </motion.div>

      {/* Right decorative lines */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="pointer-events-none fixed right-0 top-1/4 hidden h-1/2 w-32 md:block"
      >
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />
        <div className="absolute right-8 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <div className="absolute right-16 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      </motion.div>

      {/* Top decorative lines */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="pointer-events-none fixed left-1/4 top-0 hidden h-32 w-1/2 md:block"
      >
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="absolute left-0 top-8 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute left-0 top-16 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </motion.div>

      {/* Bottom decorative lines */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="pointer-events-none fixed bottom-0 left-1/4 hidden h-32 w-1/2 md:block"
      >
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="absolute bottom-8 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute bottom-16 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </motion.div>
    </>
  );
}
