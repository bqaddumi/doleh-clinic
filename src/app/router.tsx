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
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { PatientDetailsPage } from '../features/patients/pages/PatientDetailsPage';
import { PatientFormPage } from '../features/patients/pages/PatientFormPage';
import { PatientsListPage } from '../features/patients/pages/PatientsListPage';
import { ReportDetailsPage } from '../features/reports/pages/ReportDetailsPage';
import { ReportFormPage } from '../features/reports/pages/ReportFormPage';
import { ReportsListPage } from '../features/reports/pages/ReportsListPage';
import { LoadingScreen } from '../components/LoadingScreen';
import { AppLayout } from '../layouts/AppLayout';

interface RouterContext {
  queryClient: QueryClient;
  auth: {
    isAuthenticated: boolean;
    isLoading: boolean;
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
      throw redirect({ to: '/' });
    }
  },
  component: LoginPage
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
  path: '/',
  component: DashboardPage
});

const patientsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/patients',
  component: PatientsListPage
});

const newPatientRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/patients/new',
  component: () => <PatientFormPage />
});

const patientDetailsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/patients/$patientId',
  component: PatientDetailsRoute
});

const editPatientRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/patients/$patientId/edit',
  component: EditPatientRoute
});

const reportsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/reports',
  component: ReportsListPage
});

const newReportRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/reports/new',
  validateSearch: (search: Record<string, unknown>) => ({
    patientId: typeof search.patientId === 'string' ? search.patientId : ''
  }),
  component: NewReportRoute
});

const reportDetailsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/reports/$reportId',
  component: ReportDetailsRoute
});

const editReportRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/reports/$reportId/edit',
  component: EditReportRoute
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    patientsRoute,
    newPatientRoute,
    patientDetailsRoute,
    editPatientRoute,
    reportsRoute,
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
