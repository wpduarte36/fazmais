import { createBrowserRouter } from 'react-router-dom'
import { Role } from '@fazmais/shared'
import { PlaceholderPage } from './PlaceholderPage'
import { RequireRole } from './RequireRole'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { MasterPanelPage } from '../features/master/pages/MasterPanelPage'
import { CatalogoBuilderPage } from '../features/master/pages/CatalogoBuilderPage'
import { AdminPanelPage } from '../features/admin/pages/AdminPanelPage'
import { HomePage } from '../features/professor/pages/HomePage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/master',
    element: (
      <RequireRole role={Role.MASTER}>
        <MasterPanelPage />
      </RequireRole>
    ),
  },
  {
    path: '/master/catalogos/:id',
    element: (
      <RequireRole role={Role.MASTER}>
        <CatalogoBuilderPage />
      </RequireRole>
    ),
  },
  {
    path: '/admin',
    element: (
      <RequireRole role={Role.ADMIN}>
        <AdminPanelPage />
      </RequireRole>
    ),
  },
  { path: '/pesquisa-ia', element: <PlaceholderPage title="Resultado da busca IA" /> },
  {
    path: '/',
    element: (
      <RequireRole role={Role.PROFESSOR}>
        <HomePage />
      </RequireRole>
    ),
  },
])
