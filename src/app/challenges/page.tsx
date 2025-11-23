'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DailyChallenge } from '@/components/challenges/DailyChallenge';
import { GradientBackdrop } from '@/components/layout/GradientBackdrop';
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
  const [view, setView] = useState<'today' | 'history'>('today');

  const currentLanguage = LANGUAGES.find(lang => lang.id === languageId);

  useEffect(() => {
    loadChallenges();
  }, [languageId]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  if (isLoading) {
    return (
      <main className="relative min-h-screen overflow-hidden text-white pt-[72px] md:pt-0 pb-[80px] md:pb-0">
        <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
        <GradientBackdrop blur className="-z-20" />
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
        <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
        <GradientBackdrop blur className="-z-20" />
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
      <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
      <GradientBackdrop blur className="-z-20" />
      
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => router.push('/learn')}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  {t.challenges.title}
                </span>
              </h1>
            </div>
            <p className="text-white/60 ml-10">
              {t.challenges.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e1e1e] ring-1 ring-white/5">
              <span className="text-xs text-white/40">Language:</span>
              <Badge tone="accent" style={{ backgroundColor: currentLanguage?.highlightColor }} className="text-xs">
                {currentLanguage?.label}
              </Badge>
            </div>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mb-8 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-200 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - Today's Challenge (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                {t.challenges.todayChallenge}
              </h2>
              <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-1 rounded">
                {new Date().toLocaleDateString()}
              </span>
            </div>

            {todayChallenge ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative overflow-hidden rounded-2xl bg-[#1e1e1e] p-8 shadow-2xl ring-1 ring-white/5 transition-all hover:ring-white/10"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Target className="h-48 w-48 rotate-12 text-accent" />
                </div>

                <div className="relative z-10">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={cn("text-xs capitalize", getDifficultyColor(todayChallenge.difficulty))}>
                      {todayChallenge.difficulty}
                    </Badge>
                    <Badge tone="soft" className="text-xs bg-white/5 text-white/60">
                      <Clock className="mr-1 h-3 w-3" />
                      {todayChallenge.metadata.estimated_time_minutes} min
                    </Badge>
                  </div>

                  <h3 className="text-3xl font-bold mb-4 group-hover:text-accent transition-colors">
                    {todayChallenge.problem.title || "Daily Code Challenge"}
                  </h3>
                  
                  <p className="text-white/70 mb-8 max-w-2xl text-lg leading-relaxed line-clamp-3">
                    {todayChallenge.problem.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {todayChallenge.metadata.topics.map((topic, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-white/50 border border-white/5">
                        #{topic}
                      </span>
                    ))}
                  </div>

                  <Button
                    size="lg"
                    onClick={() => setSelectedChallenge(todayChallenge)}
                    className="h-12 px-8 text-base bg-white text-black hover:bg-white/90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    <Zap className="mr-2 h-5 w-5 fill-black" />
                    {t.challenges.solve}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-[#1e1e1e] p-12 ring-1 ring-white/5 text-center">
                <div className="mb-4 rounded-full bg-white/5 p-4">
                  <Calendar className="h-8 w-8 text-white/40" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No challenge for today</h3>
                <p className="text-white/50 max-w-md">{t.challenges.noChallengeToday}</p>
              </div>
            )}
          </div>

          {/* Sidebar - History & Stats (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <History className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl font-semibold">{t.challenges.history}</h2>
            </div>

            <div className="space-y-3">
              {challengeHistory.length > 0 ? (
                challengeHistory.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedChallenge(challenge)}
                    className="group flex cursor-pointer items-center gap-4 rounded-xl bg-[#1e1e1e] p-4 ring-1 ring-white/5 transition-all hover:bg-white/5 hover:ring-white/10"
                  >
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase",
                      getDifficultyColor(challenge.difficulty)
                    )}>
                      {challenge.difficulty[0]}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/40 font-mono">
                          {new Date(challenge.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-white/30 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
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
                <div className="text-center py-12 rounded-xl bg-[#1e1e1e] ring-1 ring-white/5">
                  <Brain className="h-8 w-8 text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-white/40">{t.challenges.noChallengeHistory}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
