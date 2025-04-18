import * as React from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';

import { useAuth } from '../auth';

export const Route = createFileRoute('/_auth/dashboard')({
  component: DashboardPage,
});


function DashboardPage() {
  const auth = useAuth();

  return (
    <section className="grid gap-2 p-2">
      <p>Hi {auth.user?.name}!</p>
      <p>You are currently on the dashboard route.</p>
    </section>
  );
}
