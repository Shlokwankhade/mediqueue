import DarkToggle from '../components/DarkToggle';
import { useTheme } from '../context/ThemeContext';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoad] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoad(true); setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch(err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally { setLoad(false); }
  };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#060E1A,#0D1B2E)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{position:'fixed',top:16,right:16,zIndex:999}}><DarkToggle/></div>
      <div style={{background:'white',borderRadius:24,padding:'40px 36px',width:'100%',maxWidth:420,boxShadow:'0 24px 64px rgba(0,0,0,.3)'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{width:48,height:48,background:tg,borderRadius:14,display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
            <i className='fas fa-key' style={{color:'white',fontSize:20}}/>
          </div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:700}}>Forgot Password?</div>
          <div style={{fontSize:13,color:'#64748B',marginTop:4}}>Enter your email to reset</div>
        </div>

        {sent ? (
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <div style={{fontSize:48,marginBottom:16}}>??</div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700,marginBottom:8}}>Email Sent!</div>
            <p style={{color:'#64748B',fontSize:14,marginBottom:20}}>Check your inbox for the password reset link. It expires in 1 hour.</p>
            <Link to='/login' style={{color:'#0D9B82',fontWeight:700,textDecoration:'none',fontSize:14}}>? Back to Login</Link>
          </div>
        ) : (
          <>
            {error && <div style={{background:'#FFE4E6',color:'#9F1239',padding:'10px 14px',borderRadius:10,fontSize:13,marginBottom:16,fontWeight:600}}>{error}</div>}
            <form onSubmit={submit}>
              <label style={{fontSize:12,fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:.4,display:'block',marginBottom:5}}>Email Address</label>
              <input
                type='email' required
                placeholder='your@email.com'
                value={email}
                onChange={e=>setEmail(e.target.value)}
                style={{width:'100%',padding:'12px 16px',background:'#F1F5F9',border:'1.5px solid #E2E8F0',borderRadius:12,fontSize:14,color:'#0A1628',outline:'none',fontFamily:'DM Sans,sans-serif',marginBottom:16}}
              />
              <button type='submit' disabled={loading} style={{width:'100%',padding:'13px',background:tg,color:'white',border:'none',borderRadius:12,fontFamily:'DM Sans,sans-serif',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(13,155,130,.3)'}}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <div style={{textAlign:'center',marginTop:20,fontSize:13,color:'#64748B'}}>
              <Link to='/login' style={{color:'#0D9B82',fontWeight:700,textDecoration:'none'}}>? Back to Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
