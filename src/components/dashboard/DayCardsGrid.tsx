'use client';

import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, Play, BookOpen, Code, Database, Cpu, Zap, Layers, Box, GitBranch } from 'lucide-react';
import { useProgressStore } from '@/store/progress-store';
import { getDayTopic } from '@/lib/content/curriculum';
import { cn } from '@/lib/utils';

// Icon mapping for different topics
const TOPIC_ICONS: Record<number, React.ElementType> = {
    1: BookOpen,
    2: GitBranch,
    3: Database,
    4: Zap,
    5: Layers,
    6: Box,
    7: Code,
    8: Cpu
};

function getIconForDay(day: number): React.ElementType {
    return TOPIC_ICONS[day] || TOPIC_ICONS[(day % 8) + 1] || Code;
}

interface DayCardProps {
    day: number;
    isCompleted: boolean;
    isActive: boolean;
    isLocked: boolean;
    topic: string;
    description?: string;
    onClick: () => void;
}

function DayCard({ day, isCompleted, isActive, isLocked, topic, description, onClick }: DayCardProps) {
    const Icon = getIconForDay(day);

    return (
        <motion.button
            onClick={onClick}
            disabled={isLocked}
            whileHover={!isLocked ? {
                scale: 1.03,
                rotateX: -2,
                rotateY: 2,
                transition: { duration: 0.2 }
            } : undefined}
            whileTap={!isLocked ? { scale: 0.98 } : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: day * 0.05 }}
            className={cn(
                'relative group flex flex-col items-start p-5 rounded-2xl text-left transition-all duration-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0094] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0515]',
                'transform-gpu perspective-1000',
                isCompleted && 'bg-gradient-to-br from-[#1a2520] to-[#0d1510] border border-green-500/30',
                isActive && 'bg-gradient-to-br from-[#2a1f35] to-[#1a0f25] border-2 border-[#ff0094]/50 shadow-[0_0_30px_rgba(255,0,148,0.2)]',
                !isCompleted && !isActive && !isLocked && 'bg-[#1a1625] border border-white/10 hover:border-white/20 hover:shadow-xl',
                isLocked && 'bg-[#12101a] border border-white/5 cursor-not-allowed'
            )}
            style={{ transformStyle: 'preserve-3d' }}
        >
            {/* Glow effect for active */}
            {isActive && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#ff0094]/10 to-[#ffd200]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}

            {/* Icon Container */}
            <div className={cn(
                'relative w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300',
                'group-hover:scale-110',
                isCompleted && 'bg-green-500/20',
                isActive && 'bg-gradient-to-br from-[#ff0094]/30 to-[#ffd200]/20',
                !isCompleted && !isActive && 'bg-white/5'
            )}>
                <Icon className={cn(
                    'w-6 h-6 transition-all duration-300',
                    isCompleted && 'text-green-400',
                    isActive && 'text-[#ff0094]',
                    !isCompleted && !isActive && !isLocked && 'text-white/50',
                    isLocked && 'text-white/20'
                )} />

                {/* Pulse animation for active */}
                {isActive && (
                    <motion.div
                        className="absolute inset-0 rounded-xl border border-[#ff0094]/50"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
            </div>

            {/* Status Badge */}
            {isCompleted && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
            )}

            {isActive && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#ff0094] to-[#ff5bc8] text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-[#ff0094]/30">
                    <Play className="w-3 h-3" fill="currentColor" />
                    Active
                </div>
            )}

            {isLocked && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-white/30" />
                </div>
            )}

            {/* Content */}
            <div className="flex-1">
                <h3 className={cn(
                    'text-base font-bold mb-1 transition-colors',
                    isCompleted && 'text-white',
                    isActive && 'text-white',
                    !isCompleted && !isActive && !isLocked && 'text-white/80',
                    isLocked && 'text-white/30'
                )}>
                    {day}: {topic}
                </h3>

                {(isActive || isCompleted) && description && (
                    <p className={cn(
                        'text-sm leading-relaxed line-clamp-2',
                        isActive ? 'text-white/60' : 'text-white/40'
                    )}>
                        {description}
                    </p>
                )}

                {isLocked && (
                    <p className="text-xs text-white/20">
                        Завершите предыдущий день
                    </p>
                )}
            </div>

            {/* Completed label */}
            {isCompleted && (
                <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-green-400">
                    ✓ Completed
                </div>
            )}
        </motion.button>
    );
}

interface DayCardsGridProps {
    maxDays?: number;
}

export function DayCardsGrid({ maxDays = 8 }: DayCardsGridProps) {
    const { activeDay, completedDays, setActiveDay, languageId } = useProgressStore((state) => ({
        activeDay: state.activeDay,
        completedDays: state.record.completedDays,
        setActiveDay: state.setActiveDay,
        languageId: state.languageId
    }));

    const handleDayClick = useCallback((day: number, isLocked: boolean) => {
        if (!isLocked) setActiveDay(day);
    }, [setActiveDay]);

    const days = useMemo(() => {
        return Array.from({ length: maxDays }, (_, i) => {
            const day = i + 1;
            const isCompleted = completedDays.includes(day);
            const isActive = day === activeDay;
            const lastCompletedDay = completedDays.length > 0 ? Math.max(...completedDays) : 0;
            const isLocked = day > 1 && day > lastCompletedDay + 1;
            const dayTopic = getDayTopic(day, languageId);

            return {
                day,
                isCompleted,
                isActive,
                isLocked,
                topic: dayTopic.topic,
                description: dayTopic.description || 'Изучите основы и практикуйтесь.'
            };
        });
    }, [activeDay, completedDays, languageId, maxDays]);

    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {days.map((dayData) => (
                <DayCard
                    key={dayData.day}
                    {...dayData}
                    onClick={() => handleDayClick(dayData.day, dayData.isLocked)}
                />
            ))}
        </section>
    );
}
