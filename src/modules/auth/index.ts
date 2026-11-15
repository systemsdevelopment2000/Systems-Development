/**
 * API PÚBLICA del módulo `auth`.
 * El resto del sistema importa SOLO desde aquí; nunca desde rutas internas
 * como ./services o ./components. Esa es la frontera del módulo.
 */
export { OnePage } from './pages/OnePage'
export { LoginPage } from './pages/LoginPage'
export { useAuth } from './hooks/useAuth'
export { MenuUsuario } from './components/MenuUsuario'
export { ModalMiCuenta } from './components/ModalMiCuenta'
export { LoginForm } from './components/LoginForm'
export { RegisterForm } from './components/RegisterForm'
export { ForgotForm } from './components/ForgotForm'
export type { Credentials, SignUpData } from './types'
