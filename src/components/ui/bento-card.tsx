import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';

interface BentoCardProps {
    className?: string;
    children: React.ReactNode;
    glowColor?: "purple" | "pink" | "orange" | "blue" | "green" | "red" | "yellow" | "none";
    delay?: number;
    onClick?: () => void;
}

export const BentoCard = ({
    className,
    children,
    glowColor = "none",
    delay = 0,
    onClick
}: BentoCardProps) => {
    const glowStyles = {
        purple: "hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] hover:border-purple-500/50",
        pink: "hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.4)] hover:border-pink-500/50",
        orange: "hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.4)] hover:border-orange-500/50",
        blue: "hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)] hover:border-blue-500/50",
        green: "hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.4)] hover:border-green-500/50",
        red: "hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.4)] hover:border-red-500/50",
        yellow: "hover:shadow-[0_0_30px_-5px_rgba(234,179,8,0.4)] hover:border-yellow-500/50",
        none: "hover:border-white/20"
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay }}
            onClick={onClick}
            className={cn(
                "relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl transition-all duration-500",
                glowStyles[glowColor],
                onClick && "cursor-pointer",
                className
            )}
        >
            <div className="relative z-10 h-full p-6">{children}</div>
            {/* Inner subtle gradient */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
        </motion.div>
    );
};
