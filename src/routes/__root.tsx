import * as React from 'react';
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import type { AuthContext } from '../auth';
import { QueryClient } from '@tanstack/react-query';

interface MyRouterContext {
  queryClient: QueryClient;
  auth: AuthContext;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" initialIsOpen={false} />
    </>
  ),
});
