'use client';

import { ReactNode } from 'react';
import { useProfileStore } from '@/store/profile-store';
import { getRoleLabel, hasRole, type UserRole } from '@/lib/auth/roles';

interface RoleGuardProps {
  allowed: UserRole | UserRole[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function RoleGuard({ allowed, fallback, children }: RoleGuardProps) {
  const role = useProfileStore((state) => state.profile.role);

  if (!hasRole(role, allowed)) {
    return (
      fallback ?? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80">
          <p>Этот раздел доступен только для роли: {Array.isArray(allowed) ? allowed.map(getRoleLabel).join(', ') : getRoleLabel(allowed)}</p>
        </div>
      )
    );
  }

  return <>{children}</>;
}

