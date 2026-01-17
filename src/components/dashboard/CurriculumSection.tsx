'use client';

import { useState } from 'react';
import { ChevronRight, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const CURRICULUM_ITEMS = [
    { id: 'syntax', title: 'Syntax & Basics', isActive: true },
    { id: 'functions', title: 'Functions', isActive: false },
    { id: 'data-structures', title: 'Data Structures', isActive: false },
    { id: 'oop', title: 'OOP Fundamentals', isActive: false },
];

export function CurriculumSection() {
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    return (
        <section className="mt-8">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <List className="w-5 h-5 text-white/60" />
                <h2 className="text-lg font-bold text-white">Curriculum</h2>
            </div>

            {/* Curriculum List */}
            <div className="space-y-2">
                {CURRICULUM_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                        className={cn(
                            'w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-200',
                            'hover:bg-white/5',
                            item.isActive && 'bg-[#1a1625]'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                'w-2 h-2 rounded-full',
                                item.isActive ? 'bg-[#ff0094]' : 'bg-white/20'
                            )} />
                            <span className={cn(
                                'font-medium',
                                item.isActive ? 'text-white' : 'text-white/60'
                            )}>
                                {item.title}
                            </span>
                        </div>
                        <ChevronRight className={cn(
                            'w-4 h-4 text-white/30 transition-transform',
                            expandedItem === item.id && 'rotate-90'
                        )} />
                    </button>
                ))}
            </div>
        </section>
    );
}
