
import { createContext, useContext, useState, useEffect } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('mq_token');
    const u = localStorage.getItem('mq_user');
    if (t && u) {
      try {
        setToken(t);
        setUser(JSON.parse(u));
        connectSocket();
      } catch(e) {
        localStorage.removeItem('mq_token');
        localStorage.removeItem('mq_user');
      }
    }
    setLoading(false);
  }, []);

  // Login accepts token + user object directly
  const login = (token, user) => {
    localStorage.setItem('mq_token', token);
    localStorage.setItem('mq_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    connectSocket();
  };

  const logout = () => {
    localStorage.removeItem('mq_token');
    localStorage.removeItem('mq_user');
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
