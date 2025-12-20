'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LANGUAGE_PATHS, getPathById, type LearningPath } from '@/data/paths';
import { useProgressStore } from '@/store/progress-store';
import { useTranslations } from '@/store/locale-store';

interface PathSelectorProps {
    onPathSelect?: (pathId: string) => void;
}

export function PathSelector({ onPathSelect }: PathSelectorProps) {
    const t = useTranslations();
    const languageId = useProgressStore((state) => state.languageId);
    const activePathId = useProgressStore((state) => state.activePathId);
    const setActivePath = useProgressStore((state) => state.setActivePath);
    const completedPathIds = useProgressStore((state) => state.completedPathIds);

    const [selectedTab, setSelectedTab] = useState<'beginner' | 'career'>('beginner');

    const languagePaths = LANGUAGE_PATHS[languageId];
    if (!languagePaths) return null;

    const { beginner, careers } = languagePaths;
    const hasCompletedBeginner = completedPathIds.includes(beginner.id);
    const activePath = activePathId ? getPathById(activePathId) : null;

    const handleSelectPath = (path: LearningPath) => {
        // Career paths require beginner completion
        if (path.type === 'career' && !hasCompletedBeginner) {
            return;
        }
        setActivePath(path.id);
        onPathSelect?.(path.id);
    };

    return (
        <section className="relative glass-panel-soft rounded-2xl p-4 sm:rounded-3xl sm:p-6">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:gap-3 mb-4">
                <h2 className="text-base font-semibold text-white/95 sm:text-lg">
                    Путь обучения
                </h2>
                <p className="text-xs text-white/65 sm:text-sm">
                    Выбери свой путь: начни с основ, затем выбери специализацию
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setSelectedTab('beginner')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedTab === 'beginner'
                        ? 'bg-gradient-to-r from-[#ff0094]/30 to-[#ffd200]/20 text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                >
                    🎓 Beginner
                </button>
                <button
                    onClick={() => setSelectedTab('career')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedTab === 'career'
                        ? 'bg-gradient-to-r from-[#ff0094]/30 to-[#ffd200]/20 text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                        } ${!hasCompletedBeginner ? 'opacity-50' : ''}`}
                >
                    💼 Профессии {!hasCompletedBeginner && '🔒'}
                </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {selectedTab === 'beginner' ? (
                    <motion.div
                        key="beginner"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <PathCard
                            path={beginner}
                            isActive={activePathId === beginner.id}
                            isCompleted={hasCompletedBeginner}
                            onSelect={() => handleSelectPath(beginner)}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="career"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {careers.map((path) => (
                            <PathCard
                                key={path.id}
                                path={path}
                                isActive={activePathId === path.id}
                                isCompleted={completedPathIds.includes(path.id)}
                                isLocked={!hasCompletedBeginner}
                                onSelect={() => handleSelectPath(path)}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Path Info */}
            {activePath && (
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-[#ff0094]/10 to-[#ffd200]/10 border border-white/10">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-xl">{activePath.icon}</span>
                        <span className="font-medium text-white">{activePath.name}</span>
                        <span className="text-white/50">•</span>
                        <span className="text-white/60">{activePath.duration} дней</span>
                    </div>
                </div>
            )}
        </section>
    );
}

interface PathCardProps {
    path: LearningPath;
    isActive: boolean;
    isCompleted: boolean;
    isLocked?: boolean;
    onSelect: () => void;
}

function PathCard({ path, isActive, isCompleted, isLocked, onSelect }: PathCardProps) {
    return (
        <motion.button
            onClick={onSelect}
            disabled={isLocked}
            whileHover={!isLocked ? { scale: 1.02 } : undefined}
            whileTap={!isLocked ? { scale: 0.98 } : undefined}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${isActive
                ? 'border-transparent bg-gradient-to-br from-[#ff0094]/25 to-[#ffd200]/15 shadow-[0_22px_55px_rgba(255,0,148,0.35)]'
                : isLocked
                    ? 'border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.06]'
                }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{path.icon}</span>
                    <div>
                        <h3 className="font-semibold text-white/90">{path.name}</h3>
                        <span className="text-xs text-white/50">{path.duration} дней</span>
                    </div>
                </div>
                {isCompleted && (
                    <span className="text-green-400 text-sm">✓ Пройден</span>
                )}
                {isLocked && (
                    <span className="text-yellow-400 text-sm">🔒</span>
                )}
            </div>

            {/* Description */}
            <p className="text-xs text-white/60 mb-3">{path.description}</p>

            {/* Skills */}
            {path.skills && path.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {path.skills.slice(0, 4).map((skill: string) => (
                        <span
                            key={skill}
                            className="px-2 py-0.5 text-[10px] rounded-full bg-white/10 text-white/70"
                        >
                            {skill}
                        </span>
                    ))}
                    {path.skills.length > 4 && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/10 text-white/50">
                            +{path.skills.length - 4}
                        </span>
                    )}
                </div>
            )}

            {/* Careers */}
            {path.careers && path.careers.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] text-white/40 uppercase">Профессии:</span>
                    <p className="text-xs text-white/70">{path.careers.join(', ')}</p>
                </div>
            )}

            {/* Active indicator */}
            {isActive && (
                <div className="mt-3 text-xs font-semibold text-gradient uppercase">
                    Текущий путь
                </div>
            )}
        </motion.button>
    );
}

export default PathSelector;
