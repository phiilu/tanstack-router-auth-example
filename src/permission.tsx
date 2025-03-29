import type { Permission } from './auth';
import { useAuth } from './auth';

interface PermissionProps {
  can: Permission;
  children: React.ReactNode;
}

export function Permission({ can, children }: PermissionProps) {
  const auth = useAuth();

  if (auth.can(can)) {
    return children;
  }

  return null;
}
