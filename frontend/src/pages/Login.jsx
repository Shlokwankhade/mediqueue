
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DarkToggle from '../components/DarkToggle';
import api from '../services/api';

const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

const DEMO = {
  patient: { email: 'patient@mediqueue.com', password: 'password' },
  doctor:  { email: 'doctor@mediqueue.com',  password: 'password' },
  admin:   { email: 'admin@mediqueue.com',   password: 'password' },
};

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoad] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('patient');

  const fillDemo = (r) => {
    setRole(r);
    setForm({ email: DEMO[r].email, password: DEMO[r].password });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoad(true);
    setError('');
    try {
      const r = await api.post('/auth/login', form);
      login(r.data.token, r.data.user);
      nav('/dashboard');
    } catch(err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoad(false);
    }
  };

  const iStyle = {
    width:'100%', padding:'12px 16px',
    background:'#F1F5F9', border:'1.5px solid #E2E8F0',
    borderRadius:12, fontSize:14, color:'#0A1628',
    outline:'none', fontFamily:'DM Sans,sans-serif', marginBottom:14
  };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#060E1A,#0D1B2E)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{position:'fixed',top:16,right:16,zIndex:999}}>
        <DarkToggle/>
      </div>
      <div style={{background:'white',borderRadius:24,padding:'40px 36px',width:'100%',maxWidth:420,boxShadow:'0 24px 64px rgba(0,0,0,.3)'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{width:52,height:52,background:tg,borderRadius:14,display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
            <i className='fas fa-heart-pulse' style={{color:'white',fontSize:24}}/>
          </div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:800,marginBottom:4,color:'#0A1628'}}>MEDIQUEUE</div>
          <div style={{fontSize:13,color:'#64748B'}}>Sign in to your account</div>
        </div>

        <div style={{background:'#F8FAFC',border:'1px solid #E2E8F0',borderRadius:12,padding:'12px 14px',marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:'#64748B',marginBottom:8}}>Demo accounts: Click to auto-fill</div>
          <div style={{display:'flex',gap:8}}>
            {[
              ['patient','fa-user','Patient','#0D9B82','#E6F7F4'],
              ['doctor','fa-user-md','Doctor','#7C3AED','#EDE9FE'],
              ['admin','fa-crown','Admin','#F59E0B','#FEF3C7']
            ].map(([r,icon,label,color,bg])=>(
              <button key={r} onClick={()=>fillDemo(r)} style={{flex:1,padding:'8px 4px',border:'1.5px solid',borderColor:role===r?color:'#E2E8F0',borderRadius:9,background:role===r?bg:'transparent',color:role===r?color:'#64748B',fontFamily:'DM Sans,sans-serif',fontSize:12,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:5,transition:'all .2s'}}>
                <i className={'fas '+icon}/>{label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{background:'#FFE4E6',color:'#9F1239',padding:'10px 14px',borderRadius:10,fontSize:13,marginBottom:16,fontWeight:600}}>
            <i className='fas fa-exclamation-circle' style={{marginRight:6}}/>{error}
          </div>
        )}

        <form onSubmit={submit}>
          <label style={{display:'block',fontSize:12,fontWeight:700,color:'#64748B',marginBottom:5,textTransform:'uppercase',letterSpacing:.4}}>Email</label>
          <input
            style={iStyle} type='email'
            placeholder='your@email.com'
            value={form.email}
            onChange={e=>setForm(f=>({...f,email:e.target.value}))}
            required
          />
          <label style={{display:'block',fontSize:12,fontWeight:700,color:'#64748B',marginBottom:5,textTransform:'uppercase',letterSpacing:.4}}>Password</label>
          <input
            style={iStyle} type='password'
            placeholder='Your password'
            value={form.password}
            onChange={e=>setForm(f=>({...f,password:e.target.value}))}
            required
          />
          <button
            type='submit'
            disabled={loading}
            style={{width:'100%',padding:'13px',background:tg,color:'white',border:'none',borderRadius:12,fontFamily:'DM Sans,sans-serif',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(13,155,130,.3)',marginBottom:4,opacity:loading?0.8:1}}
          >
            {loading ? 'Signing in...' : 'Sign In as '+role.charAt(0).toUpperCase()+role.slice(1)}
          </button>
        </form>

        <div style={{textAlign:'center',marginTop:14,fontSize:13,color:'#64748B'}}>
          <Link to='/forgot-password' style={{color:'#0D9B82',fontWeight:600,textDecoration:'none'}}>Forgot Password?</Link>
        </div>
        <div style={{textAlign:'center',marginTop:10,fontSize:13,color:'#64748B'}}>
          Don't have an account?{' '}
          <Link to='/register' style={{color:'#0D9B82',fontWeight:700,textDecoration:'none'}}>Register</Link>
        </div>
      </div>
    </div>
  );
}
