
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

export default function Register() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', role:'patient' });
  const [loading, setLoad] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoad(true); setError('');
    try {
      const r = await api.post('/auth/register', form);
      login(r.data.token, r.data.user);
      nav('/dashboard');
    } catch(err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoad(false); }
  };

  const iStyle = { width:'100%', padding:'12px 16px', background:'#F1F5F9', border:'1.5px solid #E2E8F0', borderRadius:12, fontSize:14, color:'#0A1628', outline:'none', fontFamily:'DM Sans,sans-serif', marginBottom:14 };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#060E1A,#0D1B2E)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'white',borderRadius:24,padding:'40px 36px',width:'100%',maxWidth:440,boxShadow:'0 24px 64px rgba(0,0,0,.3)'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{width:48,height:48,background:tg,borderRadius:14,display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
            <i className='fas fa-heart-pulse' style={{color:'white',fontSize:22}}/>
          </div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:700}}>Create Account</div>
          <div style={{fontSize:13,color:'#64748B',marginTop:4}}>Join MEDIQUEUE today</div>
        </div>

        {error && <div style={{background:'#FFE4E6',color:'#9F1239',padding:'10px 14px',borderRadius:10,fontSize:13,marginBottom:16,fontWeight:600}}>{error}</div>}

        <form onSubmit={submit}>
          <label style={{fontSize:12,fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:.4,display:'block',marginBottom:5}}>Full Name</label>
          <input style={iStyle} placeholder='Your full name' value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/>

          <label style={{fontSize:12,fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:.4,display:'block',marginBottom:5}}>Email</label>
          <input style={iStyle} type='email' placeholder='your@email.com' value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required/>

          <label style={{fontSize:12,fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:.4,display:'block',marginBottom:5}}>Phone (optional)</label>
          <input style={iStyle} placeholder='+91 98765 43210' value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>

          <label style={{fontSize:12,fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:.4,display:'block',marginBottom:5}}>Password</label>
          <input style={iStyle} type='password' placeholder='Min 6 characters' value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required minLength={6}/>

          <label style={{fontSize:12,fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:.4,display:'block',marginBottom:5}}>Register As</label>
          <select style={iStyle} value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
            <option value='patient'>Patient</option>
            <option value='doctor'>Doctor</option>
          </select>

          <button type='submit' disabled={loading} style={{width:'100%',padding:'13px',background:tg,color:'white',border:'none',borderRadius:12,fontFamily:'DM Sans,sans-serif',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(13,155,130,.3)',marginTop:4}}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{textAlign:'center',marginTop:20,fontSize:13,color:'#64748B'}}>
          Already have an account? <Link to='/login' style={{color:'#0D9B82',fontWeight:700,textDecoration:'none'}}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
