export type UserRole = 'student' | 'mentor' | 'admin';

const ROLE_WEIGHT: Record<UserRole, number> = {
  student: 1,
  mentor: 2,
  admin: 3
};

export function hasRole(userRole: UserRole, required: UserRole | UserRole[]): boolean {
  const targets = Array.isArray(required) ? required : [required];
  return targets.some((role) => ROLE_WEIGHT[userRole] >= ROLE_WEIGHT[role]);
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Администратор';
    case 'mentor':
      return 'Наставник';
    default:
      return 'Студент';
  }
}

