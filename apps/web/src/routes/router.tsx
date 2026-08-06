import { createBrowserRouter } from 'react-router-dom'
import { PlaceholderPage } from './PlaceholderPage'
import { LoginPage } from '../features/auth/pages/LoginPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/master', element: <PlaceholderPage title="Painel Master" /> },
  { path: '/admin/acervo', element: <PlaceholderPage title="Painel Admin — Acervo" /> },
  { path: '/admin/usuarios', element: <PlaceholderPage title="Painel Admin — Usuários" /> },
  { path: '/pesquisa-ia', element: <PlaceholderPage title="Resultado da busca IA" /> },
  { path: '/', element: <PlaceholderPage title="Home" /> },
])
