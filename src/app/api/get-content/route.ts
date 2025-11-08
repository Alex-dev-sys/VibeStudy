import { NextResponse } from 'next/server';
import { getGeneratedContent } from '@/lib/db';

interface RequestQuery {
  day: string;
  languageId: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const day = parseInt(searchParams.get('day') ?? '1');
  const languageId = searchParams.get('languageId') ?? 'python';

  try {
    const content = getGeneratedContent(day, languageId);

    if (!content) {
      return NextResponse.json({ exists: false }, { status: 404 });
    }

    return NextResponse.json({
      exists: true,
      theory: content.theory,
      recap: content.recap,
      recapTask: content.recapTask,
      tasks: content.tasks
    });
  } catch (error) {
    console.error('Ошибка при получении контента из БД:', error);
    return NextResponse.json({ error: 'Ошибка базы данных' }, { status: 500 });
  }
}

