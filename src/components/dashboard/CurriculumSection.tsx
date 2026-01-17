'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, List, CheckCircle2, Circle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurriculumItem {
    id: string;
    title: string;
    progress: number; // 0-100
    totalDays: number;
    completedDays: number;
    isUnlocked: boolean;
}

const CURRICULUM_ITEMS: CurriculumItem[] = [
    { id: 'syntax', title: 'Syntax & Basics', progress: 100, totalDays: 8, completedDays: 8, isUnlocked: true },
    { id: 'functions', title: 'Functions', progress: 50, totalDays: 10, completedDays: 5, isUnlocked: true },
    { id: 'data-structures', title: 'Data Structures', progress: 0, totalDays: 12, completedDays: 0, isUnlocked: true },
    { id: 'oop', title: 'OOP Fundamentals', progress: 0, totalDays: 15, completedDays: 0, isUnlocked: false },
];

function ProgressBar({ progress }: { progress: number }) {
    return (
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#ff0094] to-[#ffd200]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            />
        </div>
    );
}

function CurriculumAccordionItem({ item, isExpanded, onToggle }: {
    item: CurriculumItem;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const StatusIcon = item.progress === 100 ? CheckCircle2 : item.isUnlocked ? Circle : Lock;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'rounded-2xl border transition-all duration-300 overflow-hidden',
                item.progress === 100 && 'border-green-500/30 bg-gradient-to-br from-[#1a2520]/50 to-[#0d1510]/50',
                item.progress > 0 && item.progress < 100 && 'border-[#ff0094]/30 bg-gradient-to-br from-[#2a1f35]/50 to-[#1a0f25]/50',
                item.progress === 0 && item.isUnlocked && 'border-white/10 bg-[#1a1625]/50',
                !item.isUnlocked && 'border-white/5 bg-[#12101a]/50'
            )}
        >
            <button
                onClick={onToggle}
                disabled={!item.isUnlocked}
                className={cn(
                    'w-full flex items-center justify-between p-4 text-left transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0094] focus-visible:ring-inset',
                    item.isUnlocked ? 'hover:bg-white/5' : 'cursor-not-allowed'
                )}
            >
                <div className="flex items-center gap-3 flex-1">
                    <StatusIcon className={cn(
                        'w-5 h-5 transition-colors',
                        item.progress === 100 && 'text-green-400',
                        item.progress > 0 && item.progress < 100 && 'text-[#ff0094]',
                        item.progress === 0 && item.isUnlocked && 'text-white/40',
                        !item.isUnlocked && 'text-white/20'
                    )} />

                    <div className="flex-1">
                        <h3 className={cn(
                            'font-semibold transition-colors',
                            item.isUnlocked ? 'text-white' : 'text-white/40'
                        )}>
                            {item.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-white/50">
                                {item.completedDays}/{item.totalDays} дней
                            </span>
                            {item.progress > 0 && (
                                <span className={cn(
                                    'text-xs font-medium',
                                    item.progress === 100 ? 'text-green-400' : 'text-[#ff0094]'
                                )}>
                                    {item.progress}%
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {item.isUnlocked && (
                    <ChevronDown className={cn(
                        'w-5 h-5 text-white/40 transition-transform duration-300',
                        isExpanded && 'rotate-180'
                    )} />
                )}
            </button>

            {/* Progress bar */}
            {item.isUnlocked && item.progress > 0 && (
                <div className="px-4 pb-3">
                    <ProgressBar progress={item.progress} />
                </div>
            )}

            {/* Expanded content */}
            <AnimatePresence>
                {isExpanded && item.isUnlocked && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-1">
                            <p className="text-sm text-white/50 mb-3">
                                Изучите основные концепции и закрепите знания на практике.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {Array.from({ length: Math.min(item.totalDays, 5) }, (_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium',
                                            i < item.completedDays
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-white/5 text-white/40 border border-white/10'
                                        )}
                                    >
                                        {i + 1}
                                    </div>
                                ))}
                                {item.totalDays > 5 && (
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-white/30 bg-white/5 border border-white/10">
                                        +{item.totalDays - 5}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export function CurriculumSection() {
    const [expandedItem, setExpandedItem] = useState<string | null>('functions');

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff0094]/20 to-[#ffd200]/10 border border-[#ff0094]/20 flex items-center justify-center">
                    <List className="w-5 h-5 text-[#ff0094]" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Curriculum</h2>
                    <p className="text-sm text-white/50">Ваш путь обучения</p>
                </div>
            </div>

            {/* Curriculum List */}
            <div className="space-y-3">
                {CURRICULUM_ITEMS.map((item) => (
                    <CurriculumAccordionItem
                        key={item.id}
                        item={item}
                        isExpanded={expandedItem === item.id}
                        onToggle={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                    />
                ))}
            </div>
        </motion.section>
    );
}
