import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import './index.css';
import AddPatient from './pages/patient/AddPatient';
import SearchPatient from './pages/patient/SearchPatient';
import { StaffLogin } from './pages/StaffLogin';
import { StaffOverview } from './pages/StaffOverview';
import { StaffRegistration } from './pages/StaffRegistration';
import { PrivateRouter } from './pages/PrivateRoute';
import { Vitals } from './pages/Vitals';
import { RecordVitals } from './pages/RecordVitals';
import { Consultations } from './pages/consultations';
import { Medicines } from './pages/Medicines';
import { Tests } from './pages/Tests';
import { Layout } from './components/Layout';
import { Visits } from './pages/Visits';
import { EditPatient } from './pages/patient/EditPatient';
import { AnalyticsGender } from './pages/AnalyticsGender';
import { AnalyticsStatus } from './pages/AnalyticsStatus';import { QrRouter } from './pages/QrRouter';
import FreshQRPage from './pages/patient/FreshQRPage';
import Records from './pages/Records';
import DeskPage from './pages/DeskPage';
import { CheckMedicines } from './pages/CheckMedicines';
import { Refreshments } from './pages/Refreshments';
import { PatientCounceling } from './pages/PatientCounceling';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/staff/login" /> },
  { path: '/login', element: <Navigate to="/staff/login" /> },
  { path: '/signup', element: <Navigate to="/staff/signup" /> },
  {
    path: '/staff/login',
    element: (
      <Layout>
        <StaffLogin />
      </Layout>
    ),
  },
  {
    path: '/staff/signup',
    element: <Layout><StaffRegistration /></Layout>,
  },
  {
    path: '/patient/search',
    element: (
      <PrivateRouter>
        <Layout>
          <SearchPatient />
        </Layout>
      </PrivateRouter>
    ),
  },
  {
    path: '/patient/:patientId',
    element: (
      <PrivateRouter>
        <Layout>
          <EditPatient />
        </Layout>
      </PrivateRouter>
    ),
  },
  {
    path: '/patient/qr/:qrId',
    element: (<PrivateRouter>
        <QrRouter />
      </PrivateRouter>)
  },
  {
    path: 'patient/qr/:qrId/map',
    element: (<PrivateRouter>
      <Layout>
        <FreshQRPage />
      </Layout>
    </PrivateRouter>)
  },
  {
    path: '/patient/register',
    element: (
      <PrivateRouter>
        <Layout>
          <AddPatient />
        </Layout>
      </PrivateRouter>
    ),
  },
  {
    path: '/overview',
    element: (
      <PrivateRouter>
        <Layout>
          <StaffOverview />
        </Layout>
      </PrivateRouter>
    ),
  },
  {
    path: '/analytics/gender',
    element: (
      <PrivateRouter>
        <Layout>
          <AnalyticsGender />
        </Layout>
      </PrivateRouter>
    ),
  },
  {
    path: '/analytics/status',
    element: (
      <PrivateRouter>
        <Layout>
          <AnalyticsStatus/>
        </Layout>
      </PrivateRouter>
    ),
  },
  {
    path: '/vitals',
    element: (
      <PrivateRouter>
        <Layout>
          <Vitals />
        </Layout>
      </PrivateRouter>
    ),
  },
  {
    path: '/vitals/:visitId',
    element: (
      <PrivateRouter>
        <Layout>
          <RecordVitals />
        </Layout>
      </PrivateRouter>
    ),
  },
  {
    path: '/consultations/:id',
    element: (
      <PrivateRouter>
        <Layout>
          <Consultations />
        </Layout>
      </PrivateRouter>
    ),
  },
  {
    path: '/checkMedicines/:id',
    element: (
      <PrivateRouter>
        <Layout>
          <CheckMedicines />
        </Layout>
      </PrivateRouter>
    ),
  },
  {
    path: '/medicines/:id',
    element: (
      <PrivateRouter>
        <Layout>
          <Medicines />
        </Layout>
      </PrivateRouter>
    ),
  },
  {
    path: '/tests',
    element: (
      <PrivateRouter>
        <Layout>
          <Tests />
        </Layout>
      </PrivateRouter>
    ),
  },
  {
    path: '/visits',
    element: (
      <PrivateRouter>
        <Layout>
          <Visits />
        </Layout>
      </PrivateRouter>
    ),
  },
  {
    path: '/records/:id',
    element: (
      <PrivateRouter>
        <Layout>
          <Records />
        </Layout>
      </PrivateRouter>
    ),
  },

  {
    path: '/deskpage/:deskid',
    element: (
      <PrivateRouter>
        <Layout>
          < DeskPage />
        </Layout>
      </PrivateRouter>
    ),
  },
  {
    path: '/refreshments/:visitId',
    element: (
      <PrivateRouter>
        <Layout>
          <Refreshments />
        </Layout>
      </PrivateRouter>
    ),
  },
  {
    path: '/patientCounceling/:visitId',
    element: (
      <PrivateRouter>
        <Layout>
          <PatientCounceling />
        </Layout>
      </PrivateRouter>
    ),
  },

]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
