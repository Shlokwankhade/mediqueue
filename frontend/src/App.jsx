import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:14,color:'var(--txt2)'}}>Loading...</div>;
  return user ? children : <Navigate to='/login' replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to='/dashboard' replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
      <Route path='/register' element={<PublicRoute><Register /></PublicRoute>} />
      <Route path='/dashboard' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path='/dashboard/*' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}