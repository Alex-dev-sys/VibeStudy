'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, UserPlus } from 'lucide-react';
import { GoogleButton } from './GoogleButton';
import Link from 'next/link';

interface RegisterFormProps {
    onSubmit: (email: string) => Promise<void>;
    onGoogleSignIn: () => Promise<void>;
    isLoading: boolean;
    error?: string | null;
    emailSent?: boolean;
}

export function RegisterForm({ onSubmit, onGoogleSignIn, isLoading, error, emailSent }: RegisterFormProps) {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);

    // Real-time email validation
    const validateEmail = (value: string) => {
        if (!value) {
            setEmailError(null);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setEmailError('Введите корректный email');
        } else {
            setEmailError(null);
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        validateEmail(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || emailError) {
            return;
        }

        await onSubmit(email);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
        >
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="mb-2 text-4xl font-bold text-white">Регистрация</h1>
                <p className="text-white/60">Создайте аккаунт и начните обучение</p>
            </div>

            {/* Email sent confirmation */}
            {emailSent && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 rounded-3xl border-2 border-emerald-400/30 bg-emerald-400/10 p-6 text-center"
                >
                    <div className="mb-3 text-4xl">✉️</div>
                    <p className="mb-2 text-lg font-semibold text-white">Проверьте email</p>
                    <p className="text-sm text-white/70">
                        Мы отправили ссылку для регистрации на <span className="font-semibold text-white">{email}</span>
                    </p>
                </motion.div>
            )}

            {/* Error message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="mb-6 rounded-3xl border-2 border-red-400/30 bg-red-400/10 p-4 text-center text-sm text-white"
                >
                    {error}
                </motion.div>
            )}

            {/* Form */}
            {!emailSent && (
                <div className="space-y-6">
                    {/* Google OAuth Button */}
                    <GoogleButton onClick={onGoogleSignIn} isLoading={isLoading} locale="ru" />

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-[#0a0a0a] px-4 text-white/50">или</span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                type="email"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="your@email.com"
                                disabled={isLoading}
                                aria-label="Email адрес"
                                aria-invalid={!!emailError}
                                aria-describedby={emailError ? 'email-error' : undefined}
                                className="w-full rounded-[50px] border-2 border-white bg-transparent px-8 py-4 text-white placeholder-white/40 transition-all focus:border-white/80 focus:outline-none disabled:opacity-50"
                            />
                            {emailError && (
                                <motion.p
                                    id="email-error"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    role="alert"
                                    className="mt-2 px-4 text-sm text-red-400"
                                >
                                    {emailError}
                                </motion.p>
                            )}
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading || !!emailError || !email}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative w-full overflow-hidden rounded-[50px] bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] px-8 py-4 font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        <span>Отправка...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-5 w-5" />
                                        <span>Зарегистрироваться</span>
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#ff4bc1]/80 to-[#ffd34f]/80 opacity-0 transition-opacity group-hover:opacity-100" />
                        </motion.button>
                    </form>

                    {/* Link to login */}
                    <div className="text-center">
                        <p className="text-sm text-white/60">
                            Уже есть аккаунт?{' '}
                            <Link
                                href="/login"
                                className="font-semibold text-white transition-colors hover:text-white/80"
                            >
                                Войти
                            </Link>
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
