import { createBrowserRouter } from 'react-router-dom'
import { Role } from '@fazmais/shared'
import { PlaceholderPage } from './PlaceholderPage'
import { NotFoundPage } from './NotFoundPage'
import { RequireRole } from './RequireRole'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { DefinirSenhaPage } from '../features/auth/pages/DefinirSenhaPage'
import { MasterPanelPage } from '../features/master/pages/MasterPanelPage'
import { CatalogoBuilderPage } from '../features/master/pages/CatalogoBuilderPage'
import { AdminPanelPage } from '../features/admin/pages/AdminPanelPage'
import { HomePage } from '../features/professor/pages/HomePage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/definir-senha', element: <DefinirSenhaPage /> },
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
  { path: '/pesquisa-ia', element: <PlaceholderPage title="Resultado da busca do Fabinho" /> },
  {
    path: '/',
    element: (
      <RequireRole role={Role.PROFESSOR}>
        <HomePage />
      </RequireRole>
    ),
  },
  { path: '*', element: <NotFoundPage /> },
])
