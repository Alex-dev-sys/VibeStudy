'use client';

import { Card } from '@/components/ui/Card';

export function LoadingState() {
  return (
    <Card className="text-center py-12">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-white/70">
        Генерируем теорию и задания для этого дня...
      </p>
    </Card>
  );
}
