import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './modal';
import { Button } from './button';
import { useState } from 'react';

const meta = {
    title: 'UI/Modal',
    component: Modal,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        isOpen: false,
        onClose: () => { },
        children: 'Modal Content',
    },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

function ModalExample({ size = 'md', title }: { size?: 'sm' | 'md' | 'lg' | 'xl'; title?: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size={size} title={title}>
                <div className="p-6 space-y-4">
                    <p className="text-white/80">
                        This is a modal dialog. It uses React Portal to render at the document body level,
                        ensuring it appears above all other content.
                    </p>
                    <p className="text-white/60 text-sm">
                        Press ESC or click outside to close.
                    </p>
                    <div className="flex gap-2 pt-4">
                        <Button variant="primary" onClick={() => setIsOpen(false)}>
                            Confirm
                        </Button>
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export const Default: Story = {
    render: () => <ModalExample />,
};

export const WithTitle: Story = {
    render: () => <ModalExample title="Modal Title" />,
};

export const Small: Story = {
    render: () => <ModalExample size="sm" title="Small Modal" />,
};

export const Large: Story = {
    render: () => <ModalExample size="lg" title="Large Modal" />,
};

export const ExtraLarge: Story = {
    render: () => <ModalExample size="xl" title="Extra Large Modal" />,
};

function LongContentExample() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <Button onClick={() => setIsOpen(true)}>Open Long Content Modal</Button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Long Content Example">
                <div className="p-6 space-y-4">
                    {Array.from({ length: 20 }, (_, i) => (
                        <p key={i} className="text-white/70">
                            Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                    ))}
                </div>
            </Modal>
        </div>
    );
}

export const LongContent: Story = {
    render: () => <LongContentExample />,
};
