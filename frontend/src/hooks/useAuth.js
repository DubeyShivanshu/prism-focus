import { useAuthStore } from '../store/authStore'

/**
 * useAuth — convenience hook exposing the Zustand auth store.
 * Usage: const { user, login, logout, isAuthenticated } = useAuth()
 */
const useAuth = () => useAuthStore()

export default useAuth
