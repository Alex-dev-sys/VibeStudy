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
        // No challenge for today - this is expected if not generated yet
        setTodayChallenge(null);
      } else if (todayResponse.status === 503) {
        // Database not configured - show error
        setError(t.challenges.loadError);
        return;
      } else {
        // Other errors
        const errorData = await todayResponse.json();
        console.warn('Failed to load today\'s challenge:', errorData);
      }

      // Load challenge history
      const historyResponse = await fetch(`/api/challenges?language=${languageId}&limit=10`);
      
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setChallengeHistory(historyData.challenges || []);
      } else if (historyResponse.status !== 503) {
        // Only log warning if not a configuration issue
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

  if (isLoading) {
    return (
      <main className="relative min-h-screen overflow-hidden text-white pt-[72px] md:pt-0 pb-[80px] md:pb-0">
        <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
        <GradientBackdrop blur className="-z-20" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-4xl">⏳</div>
            <p className="text-white/60">{t.common.loading}</p>
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
        <div className="relative z-10 px-4 py-8 max-w-5xl mx-auto">
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
      
      <div className="relative z-10 px-4 py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/learn')}
            className="text-white/60 hover:text-white transition-colors mb-4"
          >
            ← {t.challenges.backToLearning}
          </button>
          <h1 className="text-4xl font-bold mb-2">{t.challenges.title}</h1>
          <p className="text-white/60">{t.challenges.subtitle}</p>
        </div>

        {/* Language Selector */}
        <div className="mb-6 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
          <p className="text-sm text-white/60 mb-2">{t.challenges.selectLanguage}:</p>
          <div className="flex items-center gap-2">
            <Badge tone="accent" style={{ backgroundColor: currentLanguage?.highlightColor }}>
              {currentLanguage?.label}
            </Badge>
            <button
              onClick={() => router.push('/learn')}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {t.profile.changeLanguage}
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('today')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'today'
                ? 'bg-white/10 text-white'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            {t.challenges.todayChallenge}
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'history'
                ? 'bg-white/10 text-white'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            {t.challenges.history}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Today's Challenge */}
        {view === 'today' && (
          <div>
            {todayChallenge ? (
              <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {formatDate(todayChallenge.date)}
                    </h2>
                    <p className="text-white/70 line-clamp-2">
                      {todayChallenge.problem.description}
                    </p>
                  </div>
                  <Badge 
                    tone="accent" 
                    className={difficultyColorMap[todayChallenge.difficulty]}
                  >
                    {todayChallenge.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm text-white/60">
                    ⏱️ {todayChallenge.metadata.estimated_time_minutes} {t.challenges.minutes}
                  </span>
                  {todayChallenge.metadata.topics.length > 0 && (
                    <div className="flex gap-2">
                      {todayChallenge.metadata.topics.slice(0, 3).map((topic, idx) => (
                        <Badge key={idx} tone="soft" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant="primary"
                  onClick={() => setSelectedChallenge(todayChallenge)}
                >
                  {t.challenges.solve}
                </Button>
              </div>
            ) : (
              <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 text-center">
                <div className="text-4xl mb-4">📅</div>
                <p className="text-white/60">{t.challenges.noChallengeToday}</p>
              </div>
            )}
          </div>
        )}

        {/* Challenge History */}
        {view === 'history' && (
          <div>
            {challengeHistory.length > 0 ? (
              <div className="space-y-4">
                {challengeHistory.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => setSelectedChallenge(challenge)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {formatDate(challenge.date)}
                          </h3>
                          <Badge 
                            tone="accent" 
                            className={difficultyColorMap[challenge.difficulty]}
                          >
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        <p className="text-white/70 line-clamp-2">
                          {challenge.problem.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm text-white/60">
                        ⏱️ {challenge.metadata.estimated_time_minutes} {t.challenges.minutes}
                      </span>
                      {challenge.metadata.topics.length > 0 && (
                        <div className="flex gap-2">
                          {challenge.metadata.topics.slice(0, 3).map((topic, idx) => (
                            <Badge key={idx} tone="soft" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 text-center">
                <div className="text-4xl mb-4">📚</div>
                <p className="text-white/60">{t.challenges.noChallengeHistory}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
