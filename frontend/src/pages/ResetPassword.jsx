import DarkToggle from '../components/DarkToggle';
import { useTheme } from '../context/ThemeContext';

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

export default function ResetPassword() {
  const nav = useNavigate();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoad] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    console.log('Token from URL:', t);
    if (t) setToken(t);
    else setError('Invalid reset link. Please request a new one.');
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoad(true); setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => nav('/login'), 3000);
    } catch(err) {
      setError(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally { setLoad(false); }
  };

  const iStyle = {
    width:'100%', padding:'12px 16px',
    background:'#F1F5F9', border:'1.5px solid #E2E8F0',
    borderRadius:12, fontSize:14, color:'#0A1628',
    outline:'none', fontFamily:'DM Sans,sans-serif',
    marginBottom:14, display:'block'
  };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#060E1A,#0D1B2E)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{position:'fixed',top:16,right:16,zIndex:999}}><DarkToggle/></div>
      <div style={{background:'white',borderRadius:24,padding:'40px 36px',width:'100%',maxWidth:420,boxShadow:'0 24px 64px rgba(0,0,0,.3)'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{width:48,height:48,background:tg,borderRadius:14,display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
            <i className='fas fa-lock' style={{color:'white',fontSize:20}}/>
          </div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:700}}>Reset Password</div>
          <div style={{fontSize:13,color:'#64748B',marginTop:4}}>Enter your new password</div>
        </div>

        {done ? (
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <div style={{fontSize:48,marginBottom:16}}>?</div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700,marginBottom:8}}>Password Reset!</div>
            <p style={{color:'#64748B',fontSize:14,marginBottom:16}}>Your password has been updated successfully.</p>
            <p style={{color:'#94A3B8',fontSize:13}}>Redirecting to login in 3 seconds...</p>
          </div>
        ) : (
          <>
            {error && (
              <div style={{background:'#FFE4E6',color:'#9F1239',padding:'12px 14px',borderRadius:10,fontSize:13,marginBottom:16,fontWeight:600}}>
                {error}
                {error.includes('Invalid') && (
                  <div style={{marginTop:8}}>
                    <Link to='/forgot-password' style={{color:'#9F1239',fontWeight:700}}>Request a new reset link</Link>
                  </div>
                )}
              </div>
            )}
            {token && (
              <form onSubmit={submit}>
                <label style={{fontSize:12,fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:.4,display:'block',marginBottom:5}}>New Password</label>
                <input
                  type='password'
                  style={iStyle}
                  placeholder='Min 6 characters'
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <label style={{fontSize:12,fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:.4,display:'block',marginBottom:5}}>Confirm Password</label>
                <input
                  type='password'
                  style={iStyle}
                  placeholder='Repeat your password'
                  value={confirm}
                  onChange={e=>setConfirm(e.target.value)}
                  required
                />
                <button
                  type='submit'
                  disabled={loading}
                  style={{width:'100%',padding:'13px',background:tg,color:'white',border:'none',borderRadius:12,fontFamily:'DM Sans,sans-serif',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(13,155,130,.3)'}}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}
            <div style={{textAlign:'center',marginTop:16,fontSize:13,color:'#64748B'}}>
              <Link to='/login' style={{color:'#0D9B82',fontWeight:700,textDecoration:'none'}}>Back to Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
