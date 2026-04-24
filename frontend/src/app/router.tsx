import { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
  useParams,
  useSearch
} from '@tanstack/react-router';
import { LoginPage } from '../features/auth/LoginPage';
import { LandingPage } from '../features/landing/LandingPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { PatientDetailsPage } from '../features/patients/pages/PatientDetailsPage';
import { PatientFormPage } from '../features/patients/pages/PatientFormPage';
import { PatientsListPage } from '../features/patients/pages/PatientsListPage';
import { ReportDetailsPage } from '../features/reports/pages/ReportDetailsPage';
import { ReportFormPage } from '../features/reports/pages/ReportFormPage';
import { ReportsListPage } from '../features/reports/pages/ReportsListPage';
import { ReservationsPage } from '../features/reservations/pages/ReservationsPage';
import { LoadingScreen } from '../components/LoadingScreen';
import { AppLayout } from '../layouts/AppLayout';
import { UserRole } from '../types';

interface RouterContext {
  queryClient: QueryClient;
  auth: {
    isAuthenticated: boolean;
    isLoading: boolean;
    userRole: UserRole | null;
  };
}

const PatientDetailsRoute = () => {
  const params = useParams({ strict: false }) as { patientId: string };
  return <PatientDetailsPage patientId={params.patientId} />;
};

const EditPatientRoute = () => {
  const params = useParams({ strict: false }) as { patientId: string };
  return <PatientFormPage patientId={params.patientId} />;
};

const NewReportRoute = () => {
  const search = useSearch({ strict: false }) as { patientId?: string };
  return <ReportFormPage presetPatientId={search.patientId || ''} />;
};

const ReportDetailsRoute = () => {
  const params = useParams({ strict: false }) as { reportId: string };
  return <ReportDetailsPage reportId={params.reportId} />;
};

const EditReportRoute = () => {
  const params = useParams({ strict: false }) as { reportId: string };
  return <ReportFormPage reportId={params.reportId} />;
};

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: ({ context }) => {
    if (context.auth.isLoading) {
      return;
    }

    if (context.auth.isAuthenticated) {
      throw redirect({ to: context.auth.userRole === 'patient' ? '/reservations' : '/dashboard' });
    }
  },
  component: LoginPage
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage
});

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  beforeLoad: ({ context, location }) => {
    if (context.auth.isLoading) {
      return;
    }

    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href
        }
      });
    }
  },
  component: AppLayout
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/dashboard',
  beforeLoad: ({ context }) => {
    if (context.auth.userRole === 'patient') {
      throw redirect({ to: '/reservations' });
    }
  },
  component: DashboardPage
});

const patientsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/patients',
  beforeLoad: ({ context }) => {
    if (context.auth.userRole !== 'admin') {
      throw redirect({ to: '/reservations' });
    }
  },
  component: PatientsListPage
});

const newPatientRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/patients/new',
  beforeLoad: ({ context }) => {
    if (context.auth.userRole !== 'admin') {
      throw redirect({ to: '/reservations' });
    }
  },
  component: () => <PatientFormPage />
});

const patientDetailsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/patients/$patientId',
  beforeLoad: ({ context }) => {
    if (context.auth.userRole !== 'admin') {
      throw redirect({ to: '/reservations' });
    }
  },
  component: PatientDetailsRoute
});

const editPatientRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/patients/$patientId/edit',
  beforeLoad: ({ context }) => {
    if (context.auth.userRole !== 'admin') {
      throw redirect({ to: '/reservations' });
    }
  },
  component: EditPatientRoute
});

const reportsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/reports',
  beforeLoad: ({ context }) => {
    if (context.auth.userRole !== 'admin') {
      throw redirect({ to: '/reservations' });
    }
  },
  component: ReportsListPage
});

const reservationsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/reservations',
  component: ReservationsPage
});

const newReportRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/reports/new',
  beforeLoad: ({ context }) => {
    if (context.auth.userRole !== 'admin') {
      throw redirect({ to: '/reservations' });
    }
  },
  validateSearch: (search: Record<string, unknown>) => ({
    patientId: typeof search.patientId === 'string' ? search.patientId : ''
  }),
  component: NewReportRoute
});

const reportDetailsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/reports/$reportId',
  beforeLoad: ({ context }) => {
    if (context.auth.userRole !== 'admin') {
      throw redirect({ to: '/reservations' });
    }
  },
  component: ReportDetailsRoute
});

const editReportRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/reports/$reportId/edit',
  beforeLoad: ({ context }) => {
    if (context.auth.userRole !== 'admin') {
      throw redirect({ to: '/reservations' });
    }
  },
  component: EditReportRoute
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    patientsRoute,
    newPatientRoute,
    patientDetailsRoute,
    editPatientRoute,
    reportsRoute,
    reservationsRoute,
    newReportRoute,
    reportDetailsRoute,
    editReportRoute
  ])
]);

export const createAppRouter = (queryClient: QueryClient, auth: RouterContext['auth']) =>
  createRouter({
    routeTree,
    context: {
      queryClient,
      auth
    },
    defaultPendingComponent: LoadingScreen
  });

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
