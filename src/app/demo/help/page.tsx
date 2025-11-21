'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HelpTooltip } from '@/components/help/HelpTooltip';
import { Card } from '@/components/ui/card';

export default function HelpDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c061c] via-[#1a0b2e] to-[#0c061c] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/learn">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>

          <h1 className="text-4xl font-bold mb-3">Демо: Система помощи</h1>
          <p className="text-white/70 text-lg">
            Примеры использования компонентов справочной системы
          </p>
        </div>

        {/* HelpTooltip Examples */}
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">HelpTooltip Component</h2>
            <p className="text-white/70 mb-6">
              Компонент для отображения контекстной помощи рядом с элементами интерфейса
            </p>

            <Card className="p-6 space-y-6">
              {/* Example 1: Top */}
              <div className="flex items-center gap-3">
                <span className="text-white">Серия дней</span>
                <HelpTooltip
                  content="Количество дней подряд, когда ты завершал хотя бы одно задание. Серия сбрасывается, если пропустить день."
                  side="top"
                />
              </div>

              {/* Example 2: Right */}
              <div className="flex items-center gap-3">
                <span className="text-white">XP (Опыт)</span>
                <HelpTooltip
                  content="Очки опыта, которые ты получаешь за выполнение заданий. Накапливай XP для повышения уровня!"
                  side="right"
                />
              </div>

              {/* Example 3: Bottom */}
              <div className="flex items-center gap-3">
                <span className="text-white">Идеальный день</span>
                <HelpTooltip
                  content="День, когда ты выполнил все задания без использования подсказок. Это показатель твоей самостоятельности!"
                  side="bottom"
                />
              </div>

              {/* Example 4: Left */}
              <div className="flex items-center gap-3 justify-end">
                <HelpTooltip
                  content="Достижения разблокируются автоматически при выполнении определенных целей. Собирай их все!"
                  side="left"
                />
                <span className="text-white">Достижения</span>
              </div>

              {/* Example 5: In a form */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-white font-medium">Язык программирования</label>
                  <HelpTooltip
                    content="Выбери язык, который хочешь изучить. Ты можешь переключаться между языками в любое время."
                    side="top"
                  />
                </div>
                <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white">
                  <option>Python</option>
                  <option>JavaScript</option>
                  <option>TypeScript</option>
                </select>
              </div>

              {/* Example 6: In a stat card */}
              <div className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 text-sm">Процент завершения</span>
                    <HelpTooltip
                      content="Показывает, какой процент от всех 90 дней ты уже завершил. Продолжай в том же духе!"
                      side="top"
                    />
                  </div>
                  <span className="text-2xl font-bold text-white">45%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[45%] bg-gradient-to-r from-[#ff0094] to-[#ff5bc8]" />
                </div>
              </div>
            </Card>
          </section>

          {/* FloatingHelpButton Info */}
          <section>
            <h2 className="text-2xl font-bold mb-4">FloatingHelpButton</h2>
            <p className="text-white/70 mb-6">
              Плавающая кнопка помощи отображается в правом нижнем углу на страницах обучения, песочницы, аналитики и профиля.
            </p>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#ff0094] to-[#ff5bc8] flex items-center justify-center">
                    <span className="text-2xl">?</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Контекстная помощь</h3>
                    <p className="text-sm text-white/60">
                      Кнопка показывает разные вопросы в зависимости от текущей страницы
                    </p>
                  </div>
                </div>

                <div className="pl-15 space-y-2 text-sm text-white/70">
                  <p>• На странице обучения: вопросы о начале дня, выполнении заданий</p>
                  <p>• В песочнице: вопросы о запуске кода, сохранении сниппетов</p>
                  <p>• В аналитике: вопросы о календаре активности, рекомендациях</p>
                  <p>• В профиле: вопросы о смене языка, достижениях, синхронизации</p>
                </div>
              </div>
            </Card>
          </section>

          {/* Help Page Info */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Справочная страница</h2>
            <p className="text-white/70 mb-6">
              Полная справочная страница с поиском и категориями вопросов
            </p>

            <Card className="p-6">
              <div className="space-y-4">
                <p className="text-white/80">
                  Страница <code className="px-2 py-1 bg-white/10 rounded text-[#ff5bc8]">/help</code> содержит:
                </p>
                <ul className="space-y-2 text-white/70 pl-6">
                  <li>• Поиск по всем вопросам</li>
                  <li>• Фильтрация по категориям (Обучение, Песочница, Аналитика, Прогресс, Аккаунт)</li>
                  <li>• Раскрывающиеся FAQ с подробными ответами</li>
                  <li>• Отслеживание просмотренных тем для аналитики</li>
                  <li>• Ссылки на дополнительные ресурсы</li>
                </ul>

                <div className="pt-4">
                  <Button variant="primary" asChild>
                    <Link href="/help">Открыть справочную страницу</Link>
                  </Button>
                </div>
              </div>
            </Card>
          </section>

          {/* Settings Integration */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Интеграция с настройками</h2>
            <p className="text-white/70 mb-6">
              В профиле доступны дополнительные опции помощи
            </p>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <h3 className="font-semibold text-white mb-2">🔄 Повторить обучение</h3>
                  <p className="text-sm text-white/60">
                    Пройди интерактивное обучение заново, если нужно освежить знания о платформе
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl">
                  <h3 className="font-semibold text-white mb-2">📊 Статистика помощи</h3>
                  <p className="text-sm text-white/60">
                    Посмотри, какие темы справки ты просматривал чаще всего
                  </p>
                </div>

                <div className="pt-4">
                  <Button variant="secondary" asChild>
                    <Link href="/profile">Открыть настройки</Link>
                  </Button>
                </div>
              </div>
            </Card>
          </section>

          {/* Analytics */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Аналитика использования</h2>
            <p className="text-white/70 mb-6">
              Система отслеживает, какие темы помощи просматриваются чаще всего
            </p>

            <Card className="p-6">
              <div className="space-y-4">
                <p className="text-white/80">
                  Данные сохраняются в <code className="px-2 py-1 bg-white/10 rounded text-[#ff5bc8]">useHelpStore</code>:
                </p>
                <ul className="space-y-2 text-white/70 pl-6">
                  <li>• Количество просмотров каждой темы</li>
                  <li>• Время последнего просмотра</li>
                  <li>• Количество кликов по кнопке помощи на каждой странице</li>
                  <li>• Топ-5 самых просматриваемых тем</li>
                </ul>

                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
                  <p className="text-sm text-white/80">
                    💡 <strong>Для разработчиков:</strong> Эти данные помогают понять, какие части интерфейса вызывают больше всего вопросов и требуют улучшения UX.
                  </p>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
