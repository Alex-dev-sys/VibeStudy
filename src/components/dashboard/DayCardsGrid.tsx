'use client';

import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, Code, Database, GitBranch, Cpu, List, Repeat, Box, Zap } from 'lucide-react';
import { useProgressStore } from '@/store/progress-store';
import { getDayTopic } from '@/lib/content/curriculum';
import { cn } from '@/lib/utils';

// Icon mapping for different topics
const TOPIC_ICONS: Record<string, React.ElementType> = {
    'intro': Code,
    'variables': GitBranch,
    'data': Database,
    'operators': Zap,
    'control': Repeat,
    'lists': List,
    'functions': Box,
    'default': Cpu
};

function getIconForDay(day: number): React.ElementType {
    const iconKeys = Object.keys(TOPIC_ICONS);
    return TOPIC_ICONS[iconKeys[day % (iconKeys.length - 1)]] || TOPIC_ICONS['default'];
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
            whileHover={!isLocked ? { scale: 1.02 } : undefined}
            whileTap={!isLocked ? { scale: 0.98 } : undefined}
            className={cn(
                'relative flex flex-col items-start p-4 rounded-xl text-left transition-all duration-200 min-h-[140px]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0094]',
                isCompleted && 'bg-[#1a1625] border-2 border-green-500/50',
                isActive && 'bg-[#2a1f35] border-2 border-[#ff0094]/70',
                !isCompleted && !isActive && !isLocked && 'bg-[#1a1625] border border-white/10 hover:border-white/20',
                isLocked && 'bg-[#1a1625]/50 border border-white/5 cursor-not-allowed opacity-60'
            )}
        >
            {/* Icon Container */}
            <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                isCompleted && 'bg-green-500/20',
                isActive && 'bg-[#ff0094]/20',
                !isCompleted && !isActive && 'bg-white/5'
            )}>
                <Icon className={cn(
                    'w-5 h-5',
                    isCompleted && 'text-green-400',
                    isActive && 'text-[#ff0094]',
                    !isCompleted && !isActive && 'text-white/40'
                )} />
            </div>

            {/* Status Badge - Top Right */}
            {isCompleted && (
                <div className="absolute top-3 right-3">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                    </div>
                </div>
            )}

            {isActive && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-[#ff0094] text-[9px] font-bold uppercase tracking-wider text-white">
                    Active
                </div>
            )}

            {isLocked && (
                <div className="absolute top-3 right-3">
                    <Lock className="w-4 h-4 text-white/30" />
                </div>
            )}

            {/* Day Title */}
            <h3 className={cn(
                'text-sm font-bold mb-1',
                isCompleted && 'text-white',
                isActive && 'text-white',
                !isCompleted && !isActive && !isLocked && 'text-white/70',
                isLocked && 'text-white/40'
            )}>
                {day}: {topic}
            </h3>

            {/* Description - only for active or completed */}
            {(isActive || isCompleted) && description && (
                <p className="text-xs text-white/50 leading-relaxed line-clamp-2">
                    {description}
                </p>
            )}

            {/* Completed label */}
            {isCompleted && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-green-400 mt-auto pt-2">
                    Completed
                </p>
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

    const handleDayClick = useCallback((day: number) => {
        setActiveDay(day);
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
                description: dayTopic.description || 'Learn core concepts and practice.'
            };
        });
    }, [activeDay, completedDays, languageId, maxDays]);

    return (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {days.map((dayData) => (
                <DayCard
                    key={dayData.day}
                    {...dayData}
                    onClick={() => handleDayClick(dayData.day)}
                />
            ))}
        </section>
    );
}
