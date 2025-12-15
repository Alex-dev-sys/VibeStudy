import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription } from './card';

const meta = {
    title: 'UI/Card',
    component: Card,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Card className="w-96">
            <p className="text-white/80">This is a default card with glassmorphism styling.</p>
        </Card>
    ),
};

export const WithHeader: Story = {
    render: () => (
        <Card className="w-96">
            <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>This is a card description that provides context.</CardDescription>
            </CardHeader>
            <p className="text-white/70">Main card content goes here.</p>
        </Card>
    ),
};

export const Interactive: Story = {
    render: () => (
        <Card className="w-96 cursor-pointer">
            <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
                <CardDescription>Hover over this card to see the glass effect.</CardDescription>
            </CardHeader>
            <div className="flex gap-2">
                <div className="h-12 w-12 rounded-lg bg-accent/20" />
                <div className="h-12 w-12 rounded-lg bg-emerald-400/20" />
                <div className="h-12 w-12 rounded-lg bg-yellow-400/20" />
            </div>
        </Card>
    ),
};

export const WithStats: Story = {
    render: () => (
        <Card className="w-96">
            <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
                <CardDescription>Your learning statistics</CardDescription>
            </CardHeader>
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-accent">42</div>
                    <div className="text-xs text-white/60">Days</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">8</div>
                    <div className="text-xs text-white/60">Streak</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">95%</div>
                    <div className="text-xs text-white/60">Score</div>
                </div>
            </div>
        </Card>
    ),
};
