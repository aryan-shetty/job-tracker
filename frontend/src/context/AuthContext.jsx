import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext(null)

const API = "http://localhost:8000"

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/auth/me`)
      setUser(res.data)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = (token, userData) => {
    localStorage.setItem("token", token)
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    setToken(token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("saved_resume")
    delete axios.defaults.headers.common["Authorization"]
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}