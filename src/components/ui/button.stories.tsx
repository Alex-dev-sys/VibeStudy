import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';

const meta = {
    title: 'UI/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'ghost'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
        isLoading: {
            control: 'boolean',
        },
        disabled: {
            control: 'boolean',
        },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        variant: 'primary',
        children: 'Primary Button',
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Secondary Button',
    },
};

export const Ghost: Story = {
    args: {
        variant: 'ghost',
        children: 'Ghost Button',
    },
};

export const Small: Story = {
    args: {
        size: 'sm',
        children: 'Small Button',
    },
};

export const Medium: Story = {
    args: {
        size: 'md',
        children: 'Medium Button',
    },
};

export const Large: Story = {
    args: {
        size: 'lg',
        children: 'Large Button',
    },
};

export const Loading: Story = {
    args: {
        isLoading: true,
        children: 'Loading...',
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
        children: 'Disabled Button',
    },
};

export const WithIcon: Story = {
    args: {
        children: (
            <>
                <span>⭐</span>
                Button with Icon
            </>
        ),
    },
};
