
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import InstallPWA from './components/InstallPWA';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#94A3B8',fontSize:14}}>Loading...</div>;
  return user ? children : <Navigate to='/login' replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to='/dashboard' replace />;
}

const Loader = () => (
  <div style={{minHeight:'100vh',background:'#080F1A',display:'flex',alignItems:'center',justifyContent:'center'}}>
    <div style={{textAlign:'center'}}>
      <div style={{width:56,height:56,background:'linear-gradient(135deg,#0D9B82,#1DBEA0)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
        <i className='fas fa-heart-pulse' style={{color:'white',fontSize:22}}/>
      </div>
      <div style={{fontFamily:'Syne,sans-serif',color:'#0D9B82',fontWeight:700}}>Loading...</div>
    </div>
  </div>
);

export default function App() {
  return (
    <>
      <InstallPWA/>
      <Suspense fallback={<Loader/>}>
        <Routes>
          <Route path='/' element={<PublicRoute><Landing/></PublicRoute>}/>
          <Route path='/login' element={<PublicRoute><Login/></PublicRoute>}/>
          <Route path='/register' element={<PublicRoute><Register/></PublicRoute>}/>
          <Route path='/forgot-password' element={<ForgotPassword/>}/>
          <Route path='/reset-password' element={<ResetPassword/>}/>
          <Route path='/dashboard' element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
          <Route path='/dashboard/*' element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
          <Route path='*' element={<Navigate to='/' replace/>}/>
        </Routes>
      </Suspense>
    </>
  );
}
