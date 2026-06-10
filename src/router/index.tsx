import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/components/Layout/AppLayout';
import StoreMapPage from '@/pages/StoreMapPage';
import DisplayStandardsPage from '@/pages/DisplayStandardsPage';
import InspectionTasksPage from '@/pages/InspectionTasksPage';
import PhotoVerificationPage from '@/pages/PhotoVerificationPage';
import ReplenishmentPage from '@/pages/ReplenishmentPage';
import RectificationPage from '@/pages/RectificationPage';
import ReportsPage from '@/pages/ReportsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/store-map" replace />,
      },
      {
        path: 'store-map',
        element: <StoreMapPage />,
      },
      {
        path: 'display-standards',
        element: <DisplayStandardsPage />,
      },
      {
        path: 'inspection-tasks',
        element: <InspectionTasksPage />,
      },
      {
        path: 'photo-verification/:taskId?',
        element: <PhotoVerificationPage />,
      },
      {
        path: 'replenishment',
        element: <ReplenishmentPage />,
      },
      {
        path: 'rectification',
        element: <RectificationPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/store-map" replace />,
      },
    ],
  },
]);
