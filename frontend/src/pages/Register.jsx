import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', role:'patient' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(form);
      nav('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const field = (label, key, type='text', ph='') => (
    <div style={{marginBottom:14}}>
      <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--txt2)',marginBottom:5,textTransform:'uppercase',letterSpacing:.4}}>{label}</label>
      <input type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={ph} required={key!=='phone'} style={{width:'100%',padding:'11px 14px',background:'var(--surf2)',border:'1.5px solid var(--bdr)',borderRadius:10,fontSize:13,color:'var(--txt)',outline:'none'}}/>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div className='si' style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:24,padding:40,width:'100%',maxWidth:420,boxShadow:'0 24px 64px rgba(0,0,0,.12)'}}>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:22,marginBottom:6}}>Create Account</div>
        <div style={{fontSize:13,color:'var(--txt2)',marginBottom:24}}>Join MEDIQUEUE today</div>
        <form onSubmit={submit}>
          {field('Full Name','name','text','Your full name')}
          {field('Email','email','email','email@example.com')}
          {field('Phone','phone','tel','+91 9876543210')}
          {field('Password','password','password','Min 6 characters')}
          <div style={{marginBottom:20}}>
            <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--txt2)',marginBottom:5,textTransform:'uppercase',letterSpacing:.4}}>Role</label>
            <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={{width:'100%',padding:'11px 14px',background:'var(--surf2)',border:'1.5px solid var(--bdr)',borderRadius:10,fontSize:13,color:'var(--txt)',outline:'none'}}>
              <option value='patient'>Patient</option>
              <option value='doctor'>Doctor</option>
            </select>
          </div>
          {error && <div style={{background:'#FFE4E6',color:'#9F1239',borderRadius:8,padding:'10px 13px',fontSize:13,marginBottom:14}}>{error}</div>}
          <button type='submit' disabled={loading} style={{width:'100%',padding:'13px',background:tg,color:'#fff',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(13,155,130,.35)'}}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div style={{textAlign:'center',marginTop:18,fontSize:13,color:'var(--txt2)'}}>
          Already have an account? <Link to='/login' style={{color:'var(--teal)',fontWeight:600}}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}