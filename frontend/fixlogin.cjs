const fs = require('fs');

const loginContent = `import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('patient');

  const demos = {
    patient: { email: 'patient@mediqueue.com', password: 'password' },
    doctor:  { email: 'doctor@mediqueue.com',  password: 'password' },
    admin:   { email: 'admin@mediqueue.com',   password: 'password' }
  };

  const fillDemo = (r) => {
    setRole(r);
    setForm(demos[r]);
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      nav('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div className='si' style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:24,padding:40,width:'100%',maxWidth:420,boxShadow:'0 24px 64px rgba(0,0,0,.12)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:24}}>
          <div style={{width:40,height:40,background:tg,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <i className='fas fa-heart-pulse' style={{color:'#fff',fontSize:18}}/>
          </div>
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:19}}>MEDIQUEUE</div>
            <div style={{fontSize:12,color:'var(--txt3)'}}>Sign in to your account</div>
          </div>
        </div>

        <div style={{background:'var(--tealXL)',border:'1px solid rgba(13,155,130,.2)',borderRadius:10,padding:'10px 13px',fontSize:12,color:'var(--tealDk)',marginBottom:18}}>
          <strong>Demo accounts:</strong> Click a role below to auto-fill
        </div>

        <div style={{display:'flex',gap:4,background:'var(--surf2)',borderRadius:10,padding:4,marginBottom:22}}>
          {['patient','doctor','admin'].map(r => (
            <button key={r} onClick={() => fillDemo(r)} style={{flex:1,padding:'8px 4px',border:'none',borderRadius:8,fontFamily:'DM Sans,sans-serif',fontSize:12,fontWeight:600,cursor:'pointer',background:role===r?'var(--surf)':'transparent',color:role===r?'var(--teal)':'var(--txt2)',transition:'all .2s',boxShadow:role===r?'0 1px 4px rgba(0,0,0,.08)':'none'}}>
              {r==='patient' ? '👤 Patient' : r==='doctor' ? '👨‍⚕️ Doctor' : '👑 Admin'}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          <div style={{marginBottom:14}}>
            <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--txt2)',marginBottom:5,textTransform:'uppercase',letterSpacing:.4}}>Email</label>
            <input
              type='email'
              value={form.email}
              onChange={e => setForm(f => ({...f, email: e.target.value}))}
              placeholder='email@example.com'
              required
              style={{width:'100%',padding:'11px 14px',background:'var(--surf2)',border:'1.5px solid var(--bdr)',borderRadius:10,fontSize:13,color:'var(--txt)',outline:'none'}}
            />
          </div>
          <div style={{marginBottom:20}}>
            <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--txt2)',marginBottom:5,textTransform:'uppercase',letterSpacing:.4}}>Password</label>
            <input
              type='password'
              value={form.password}
              onChange={e => setForm(f => ({...f, password: e.target.value}))}
              placeholder='password'
              required
              style={{width:'100%',padding:'11px 14px',background:'var(--surf2)',border:'1.5px solid var(--bdr)',borderRadius:10,fontSize:13,color:'var(--txt)',outline:'none'}}
            />
          </div>
          {error && (
            <div style={{background:'#FFE4E6',color:'#9F1239',borderRadius:8,padding:'10px 13px',fontSize:13,marginBottom:14}}>
              {error}
            </div>
          )}
          <button type='submit' disabled={loading} style={{width:'100%',padding:'13px',background:tg,color:'#fff',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(13,155,130,.35)'}}>
            {loading ? 'Signing in...' : 'Sign In as ' + role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        </form>

        <div style={{textAlign:'center',marginTop:18,fontSize:13,color:'var(--txt2)'}}>
          Don't have an account? <Link to='/register' style={{color:'var(--teal)',fontWeight:600}}>Register</Link>
        </div>
      </div>
    </div>
  );
}`;

fs.writeFileSync('src/pages/Login.jsx', loginContent);
console.log('✅ Login.jsx completely rewritten!');
console.log('All 3 roles use password: password');