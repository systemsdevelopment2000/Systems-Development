import { RouterProvider } from 'react-router-dom'
import { AppProviders } from '@/app/providers'
import { router } from '@/app/router'
import { BrilloMouse } from '@/app/BrilloMouse'

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
      <BrilloMouse />
    </AppProviders>
  )
}
