import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mq_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const t = localStorage.getItem('mq_token');
      const u = localStorage.getItem('mq_user');
      if (t && u) {
        setToken(t);
        setUser(JSON.parse(u));
        connectSocket();
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user } = res.data;
    localStorage.setItem('mq_token', token);
    localStorage.setItem('mq_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    connectSocket();
    return user;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token, user } = res.data;
    localStorage.setItem('mq_token', token);
    localStorage.setItem('mq_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    connectSocket();
    return user;
  };

  const logout = () => {
    localStorage.removeItem('mq_token');
    localStorage.removeItem('mq_user');
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;