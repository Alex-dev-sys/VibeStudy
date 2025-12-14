import { NextRequest, NextResponse } from 'next/server';
import { deleteGeneratedContent, deleteAllGeneratedContent } from '@/lib/db';
import { logInfo, logWarn } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { day, languageId, secret, all } = body;

        // Simple security check (replace with better auth if needed)
        // For now, assuming this is a developer tool
        if (!secret || secret !== (process.env.ADMIN_SECRET || 'vibestudy-admin-secret')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (all) {
            deleteAllGeneratedContent();
            logInfo('Admin CLEARED ALL content cache', {
                component: 'api/admin',
                action: 'clear-all-cache'
            });
            return NextResponse.json({
                success: true,
                message: `ALL generated content cleared successfully`
            });
        }

        if (!day || !languageId) {
            return NextResponse.json(
                { error: 'Missing day or languageId (or "all" flag)' },
                { status: 400 }
            );
        }

        deleteGeneratedContent(day, languageId);

        logInfo('Admin cleared content cache', {
            component: 'api/admin',
            action: 'clear-cache',
            metadata: { day, languageId }
        });

        return NextResponse.json({
            success: true,
            message: `Content for Day ${day} (${languageId}) cleared successfully`
        });
    } catch (error) {
        logWarn('Failed to clear cache', {
            component: 'api/admin',
            action: 'clear-cache',
            metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
