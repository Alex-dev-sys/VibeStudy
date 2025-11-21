/**
 * Accessibility Demo Page
 * Showcases all accessibility features and best practices
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input, Textarea, Select, Checkbox, RadioGroup, Label } from '@/components/ui/Form';
import { announce } from '@/lib/accessibility/aria-announcer';
import { useReducedMotion } from '@/lib/accessibility/reduced-motion';
import { useHighContrast } from '@/lib/accessibility/high-contrast';
import { useKeyboardShortcuts } from '@/lib/accessibility/keyboard-navigation';
import { motion } from 'framer-motion';
import { 
  Keyboard, 
  Eye, 
  Volume2, 
  Contrast, 
  Zap, 
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

export default function AccessibilityDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    subscribe: false,
    preference: 'email',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const prefersReducedMotion = useReducedMotion();
  const contrastPreference = useHighContrast();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'Ctrl+k': () => {
      announce('Keyboard shortcuts activated', 'polite');
    },
    'Ctrl+m': () => {
      setIsModalOpen(true);
      announce('Modal opened', 'polite');
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.message) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      announce(`Form has ${Object.keys(newErrors).length} errors`, 'assertive');
      return;
    }
    
    announce('Form submitted successfully!', 'polite');
    console.log('Form data:', formData);
  };

  const handleAnnouncement = (message: string, type: 'polite' | 'assertive') => {
    announce(message, type);
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header>
          <h1 className="text-4xl font-bold mb-4">Accessibility Features Demo</h1>
          <p className="text-lg text-white/70">
            This page demonstrates all accessibility features implemented in VibeStudy.
            Try navigating with keyboard only (Tab, Enter, Escape) and test with screen readers.
          </p>
        </header>

        {/* Status Indicators */}
        <Card>
          <h2 className="text-2xl font-bold mb-6">Accessibility Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
              <Zap className="w-6 h-6 text-yellow-400" />
              <div>
                <div className="font-semibold">Reduced Motion</div>
                <div className="text-sm text-white/60">
                  {prefersReducedMotion ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
              <Contrast className="w-6 h-6 text-blue-400" />
              <div>
                <div className="font-semibold">Contrast Preference</div>
                <div className="text-sm text-white/60 capitalize">
                  {contrastPreference}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Keyboard Navigation */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Keyboard className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Keyboard Navigation</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-white/70">
              All interactive elements are keyboard accessible. Try these shortcuts:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/5">
                <kbd className="px-2 py-1 rounded bg-white/10 text-sm font-mono">Tab</kbd>
                <span className="ml-2 text-sm text-white/70">Navigate forward</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <kbd className="px-2 py-1 rounded bg-white/10 text-sm font-mono">Shift+Tab</kbd>
                <span className="ml-2 text-sm text-white/70">Navigate backward</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <kbd className="px-2 py-1 rounded bg-white/10 text-sm font-mono">Enter</kbd>
                <span className="ml-2 text-sm text-white/70">Activate button/link</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <kbd className="px-2 py-1 rounded bg-white/10 text-sm font-mono">Escape</kbd>
                <span className="ml-2 text-sm text-white/70">Close modal</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <kbd className="px-2 py-1 rounded bg-white/10 text-sm font-mono">Ctrl+M</kbd>
                <span className="ml-2 text-sm text-white/70">Open modal</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={() => handleAnnouncement('Button clicked!', 'polite')}>
                Primary Button
              </Button>
              <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>
              <Button variant="ghost" onClick={() => handleAnnouncement('Ghost button clicked', 'polite')}>
                Ghost Button
              </Button>
            </div>
          </div>
        </Card>

        {/* Screen Reader Announcements */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Volume2 className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Screen Reader Announcements</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-white/70">
              Test ARIA live regions with these announcement buttons:
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleAnnouncement('This is a polite announcement', 'polite')}
                ariaLabel="Trigger polite announcement"
              >
                <Info className="w-4 h-4" />
                Polite Announcement
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => handleAnnouncement('This is an assertive announcement!', 'assertive')}
                ariaLabel="Trigger assertive announcement"
              >
                <AlertCircle className="w-4 h-4" />
                Assertive Announcement
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => handleAnnouncement('Success! Operation completed.', 'polite')}
                ariaLabel="Trigger success announcement"
              >
                <CheckCircle className="w-4 h-4" />
                Success Message
              </Button>
            </div>
          </div>
        </Card>

        {/* Accessible Forms */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Eye className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Accessible Forms</h2>
          </div>
          
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <Input
              label="Name"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
              helperText="Enter your full name"
            />

            <Input
              label="Email"
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
              helperText="We'll never share your email"
            />

            <Textarea
              label="Message"
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              error={errors.message}
              required
              helperText="Tell us what you think"
            />

            <Select
              label="Preferred Language"
              id="language"
              options={[
                { value: 'en', label: 'English' },
                { value: 'ru', label: 'Русский' },
                { value: 'es', label: 'Español' },
              ]}
              helperText="Choose your preferred language"
            />

            <Checkbox
              label="Subscribe to newsletter"
              id="subscribe"
              checked={formData.subscribe}
              onChange={(e) => setFormData({ ...formData, subscribe: e.target.checked })}
              helperText="Get updates about new features"
            />

            <RadioGroup
              name="preference"
              label="Contact Preference"
              value={formData.preference}
              onChange={(value) => setFormData({ ...formData, preference: value })}
              options={[
                { value: 'email', label: 'Email', helperText: 'Receive updates via email' },
                { value: 'sms', label: 'SMS', helperText: 'Receive updates via text message' },
                { value: 'none', label: 'No contact', helperText: 'Do not contact me' },
              ]}
            />

            <div className="flex gap-3">
              <Button type="submit">
                Submit Form
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setFormData({ name: '', email: '', message: '', subscribe: false, preference: 'email' });
                  setErrors({});
                  announce('Form reset', 'polite');
                }}
              >
                Reset
              </Button>
            </div>
          </form>
        </Card>

        {/* Motion Preferences */}
        <Card>
          <h2 className="text-2xl font-bold mb-6">Motion Preferences</h2>
          
          <div className="space-y-4">
            <p className="text-white/70">
              Animations respect your motion preferences. Current setting: {' '}
              <strong>{prefersReducedMotion ? 'Reduced' : 'Normal'}</strong>
            </p>
            
            <div className="flex gap-4">
              <motion.div
                animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
                transition={prefersReducedMotion ? {} : { repeat: Infinity, duration: 2 }}
                className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
              
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Animated Element</h3>
                <p className="text-sm text-white/60">
                  This element animates when motion is enabled, but remains static when reduced motion is preferred.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Focus Management */}
        <Card>
          <h2 className="text-2xl font-bold mb-6">Focus Management</h2>
          
          <div className="space-y-4">
            <p className="text-white/70">
              Focus indicators are visible when navigating with keyboard. Try tabbing through these elements:
            </p>
            
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                Focusable Button 1
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                Focusable Button 2
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                Focusable Button 3
              </button>
              <a 
                href="#" 
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={(e) => e.preventDefault()}
              >
                Focusable Link
              </a>
            </div>
          </div>
        </Card>

        {/* Modal Example */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Accessible Modal"
          ariaLabel="Example accessible modal dialog"
        >
          <div className="p-6 space-y-4">
            <p className="text-white/80">
              This modal demonstrates proper accessibility features:
            </p>
            
            <ul className="list-disc list-inside space-y-2 text-white/70">
              <li>Focus is trapped within the modal</li>
              <li>Escape key closes the modal</li>
              <li>Focus returns to trigger button on close</li>
              <li>Proper ARIA attributes (role, aria-modal, aria-labelledby)</li>
              <li>Screen reader announcements</li>
            </ul>
            
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setIsModalOpen(false)}>
                Close Modal
              </Button>
              <Button variant="secondary" onClick={() => announce('Action performed in modal', 'polite')}>
                Perform Action
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
