import { useEffect, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { queryClient } from './lib/queryClient'
import { refreshAccessToken } from './lib/apiClient'
import { router } from './routes/router'

// O access token só vive em memória (nunca em localStorage — ver
// tokenStore.ts), então um F5 zera o estado de auth mesmo com o refresh
// token (cookie httpOnly, 7 dias) ainda válido. Antes de renderizar as
// rotas, tenta trocar esse cookie por um access token novo silenciosamente;
// se não houver cookie ou ele já tiver expirado, cai no login normalmente.
function App() {
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    void refreshAccessToken().finally(() => setIsBootstrapping(false))
  }, [])

  if (isBootstrapping) {
    return <div className="min-h-screen bg-[#07070c]" />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App
