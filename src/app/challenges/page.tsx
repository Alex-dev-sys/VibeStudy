'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DailyChallenge } from '@/components/challenges/DailyChallenge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProgressStore } from '@/store/progress-store';
import { useTranslations } from '@/store/locale-store';
import { LANGUAGES } from '@/lib/languages';
import { difficultyColorMap } from '@/lib/utils';
import { logError, logInfo } from '@/lib/logger';
import { Calendar, Trophy, Clock, Brain, ChevronRight, Zap, Star, ArrowLeft, Target, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { GradientBackdrop } from '@/components/layout/GradientBackdrop';
import { BentoCard } from '@/components/ui/bento-card';

interface Challenge {
  id: string;
  date: string;
  language: string;
  problem: any;
  test_cases: any[];
  difficulty: 'easy' | 'medium' | 'hard';
  metadata: {
    topics: string[];
    estimated_time_minutes: number;
  };
}

export default function ChallengesPage() {
  const router = useRouter();
  const { languageId } = useProgressStore();
  const t = useTranslations();

  const [todayChallenge, setTodayChallenge] = useState<Challenge | null>(null);
  const [challengeHistory, setChallengeHistory] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentLanguage = LANGUAGES.find(lang => lang.id === languageId);

  useEffect(() => {
    const loadChallenges = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load today's challenge
        const todayResponse = await fetch(`/api/challenges?language=${languageId}`);

        if (todayResponse.ok) {
          const todayData = await todayResponse.json();
          setTodayChallenge(todayData.challenge);
        } else if (todayResponse.status === 404) {
          setTodayChallenge(null);
        } else if (todayResponse.status === 503) {
          setError(t.challenges.loadError);
          return;
        } else {
          const errorData = await todayResponse.json();
          console.warn('Failed to load today\'s challenge:', errorData);
        }

        // Load challenge history
        const historyResponse = await fetch(`/api/challenges?language=${languageId}&limit=10`);

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setChallengeHistory(historyData.challenges || []);
        } else if (historyResponse.status !== 503) {
          console.warn('Failed to load challenge history');
        }

        logInfo('Challenges loaded', {
          component: 'ChallengesPage',
          action: 'loadChallenges',
          metadata: { language: languageId }
        });

      } catch (err) {
        logError('Error loading challenges', err as Error, {
          component: 'ChallengesPage',
          action: 'loadChallenges'
        });
        setError(t.challenges.loadError);
      } finally {
        setIsLoading(false);
      }
    };

    loadChallenges();
  }, [languageId, t.challenges.loadError]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  if (isLoading) {
    return (
      <main className="relative min-h-screen overflow-hidden text-white pt-[72px] md:pt-0 pb-[80px] md:pb-0">
        <GradientBackdrop className="opacity-40" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-accent"></div>
            <p className="text-white/60 font-medium">{t.common.loading}</p>
          </div>
        </div>
      </main>
    );
  }

  // Show selected challenge
  if (selectedChallenge && currentLanguage) {
    return (
      <main className="relative min-h-screen overflow-hidden text-white pt-[72px] md:pt-0 pb-[80px] md:pb-0">
        <GradientBackdrop className="opacity-40" />
        <div className="relative z-10 px-4 py-8 max-w-7xl mx-auto">
          <DailyChallenge
            challenge={selectedChallenge}
            languageId={languageId}
            monacoLanguage={currentLanguage.monacoLanguage}
            onBack={() => setSelectedChallenge(null)}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-white pt-[72px] md:pt-0 pb-[80px] md:pb-0">
      <GradientBackdrop className="opacity-40" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/learn')}
                className="text-white/50 hover:text-white pl-0 hover:bg-transparent"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Назад
              </Button>
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">{t.challenges.title}</span>
            </h1>
            <p className="mt-2 text-lg text-white/60">
              {t.challenges.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-xs text-white/40 uppercase tracking-wider">Language</span>
              <Badge
                tone="soft"
                style={{
                  backgroundColor: `${currentLanguage?.highlightColor}20`,
                  color: currentLanguage?.highlightColor,
                  borderColor: `${currentLanguage?.highlightColor}40`,
                  borderWidth: '1px'
                }}
                className="text-xs font-bold"
              >
                {currentLanguage?.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-200 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content - Today's Challenge (8 cols) */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-yellow-400" />
                {t.challenges.todayChallenge}
              </h2>
              <span className="text-xs font-mono text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                {new Date().toLocaleDateString()}
              </span>
            </div>

            {todayChallenge ? (
              <BentoCard glowColor="yellow" className="h-full min-h-[400px] flex flex-col">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                  <Target className="h-64 w-64 rotate-12 text-yellow-500" />
                </div>

                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Badge className={cn("text-xs capitalize px-3 py-1", getDifficultyColor(todayChallenge.difficulty))}>
                      {todayChallenge.difficulty}
                    </Badge>
                    <Badge tone="soft" className="text-xs bg-white/5 text-white/60 px-3 py-1">
                      <Clock className="mr-1.5 h-3 w-3" />
                      {todayChallenge.metadata.estimated_time_minutes} min
                    </Badge>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white leading-tight">
                    {todayChallenge.problem.title || "Daily Code Challenge"}
                  </h3>

                  <p className="text-white/70 mb-8 max-w-2xl text-lg leading-relaxed line-clamp-4">
                    {todayChallenge.problem.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-auto">
                    {todayChallenge.metadata.topics.map((topic, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-white/50 border border-white/5 font-mono">
                        #{topic}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/5">
                    <Button
                      size="lg"
                      onClick={() => setSelectedChallenge(todayChallenge)}
                      className="w-full sm:w-auto h-12 px-8 text-base font-bold bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-105 transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] border-0"
                    >
                      <Zap className="mr-2 h-5 w-5 fill-black" />
                      {t.challenges.solve}
                    </Button>
                  </div>
                </div>
              </BentoCard>
            ) : (
              <BentoCard className="h-64 flex flex-col items-center justify-center text-center" glowColor="none">
                <div className="mb-4 rounded-full bg-white/5 p-4">
                  <Calendar className="h-8 w-8 text-white/40" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No challenge for today</h3>
                <p className="text-white/50 max-w-md">{t.challenges.noChallengeToday}</p>
              </BentoCard>
            )}
          </div>

          {/* Sidebar - History & Stats (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4 px-2">
                <History className="h-5 w-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">{t.challenges.history}</h2>
              </div>

              <BentoCard className="min-h-[400px]" glowColor="blue">
                <div className="space-y-3">
                  {challengeHistory.length > 0 ? (
                    challengeHistory.map((challenge, index) => (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setSelectedChallenge(challenge)}
                        className="group flex cursor-pointer items-center gap-4 rounded-xl bg-white/5 p-3 ring-1 ring-white/5 transition-all hover:bg-white/10 hover:ring-white/10 hover:translate-x-1"
                      >
                        <div className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase shadow-lg",
                          getDifficultyColor(challenge.difficulty)
                        )}>
                          {challenge.difficulty[0]}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
                              {new Date(challenge.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-[10px] text-white/30 flex items-center bg-white/5 px-1.5 py-0.5 rounded">
                              <Clock className="h-2.5 w-2.5 mr-1" />
                              {challenge.metadata.estimated_time_minutes}m
                            </span>
                          </div>
                          <h4 className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                            {challenge.problem.title || "Archive Challenge"}
                          </h4>
                        </div>

                        <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/60 transition-colors" />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Brain className="h-8 w-8 text-white/20 mx-auto mb-3" />
                      <p className="text-sm text-white/40">{t.challenges.noChallengeHistory}</p>
                    </div>
                  )}
                </div>
              </BentoCard>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
