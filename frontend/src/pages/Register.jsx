import DarkToggle from '../components/DarkToggle';
import { useTheme } from '../context/ThemeContext';

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

const iStyle = {
  width:'100%', padding:'11px 14px',
  background:'#F1F5F9', border:'1.5px solid #E2E8F0',
  borderRadius:10, fontSize:14, color:'#0A1628',
  outline:'none', fontFamily:'DM Sans,sans-serif',
  marginBottom:14, display:'block'
};

const lStyle = {
  display:'block', fontSize:12, fontWeight:700,
  color:'#64748B', marginBottom:5,
  textTransform:'uppercase', letterSpacing:.4
};

export default function Register() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('patient');
  const [loading, setLoad] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name:'', email:'', password:'', phone:'',
    speciality:'', experience_years:'', consultation_fee:'',
    bio:'', room_number:'', qualification:''
  });

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Please fill all required fields'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    if (role === 'doctor') setStep(2);
    else submitRegister();
  };

  const submitRegister = async (e) => {
    if (e) e.preventDefault();
    setLoad(true); setError('');
    try {
      const payload = { ...form, role };
      const r = await api.post('/auth/register', payload);
      login(r.data.token, r.data.user);

      // If doctor, create doctor profile
      if (role === 'doctor' && r.data.user) {
        try {
          await api.post('/doctors/profile', {
            speciality: form.speciality || 'General',
            experience_years: parseInt(form.experience_years) || 0,
            consultation_fee: parseFloat(form.consultation_fee) || 500,
            bio: form.bio || '',
            room_number: form.room_number || '',
            qualification: form.qualification || ''
          });
        } catch(de) { console.error('Doctor profile error:', de.message); }
      }

      nav('/dashboard');
    } catch(err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoad(false); }
  };

  const specialities = [
    'General Medicine','Cardiology','Orthopaedics','Dermatology',
    'Neurology','Gynaecology','Paediatrics','Ophthalmology',
    'ENT','Psychiatry','Oncology','Urology','Nephrology','Other'
  ];

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#060E1A,#0D1B2E)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{position:'fixed',top:16,right:16,zIndex:999}}><DarkToggle/></div>
      <div style={{background:'white',borderRadius:24,width:'100%',maxWidth:480,boxShadow:'0 24px 64px rgba(0,0,0,.3)',overflow:'hidden'}}>

        {/* Header */}
        <div style={{background:tg,padding:'28px 36px'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
            <div style={{width:38,height:38,background:'rgba(255,255,255,.2)',borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <i className='fas fa-heart-pulse' style={{color:'white',fontSize:17}}/>
            </div>
            <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:17,color:'white'}}>MEDIQUEUE</div>
          </div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700,color:'white',marginBottom:4}}>
            {step===1 ? 'Create Account' : 'Doctor Profile'}
          </div>
          <div style={{fontSize:13,color:'rgba(255,255,255,.8)'}}>
            {step===1 ? 'Join the MEDIQUEUE platform' : 'Complete your professional profile'}
          </div>

          {/* Progress for doctor */}
          {role === 'doctor' && (
            <div style={{display:'flex',gap:8,marginTop:16}}>
              {[1,2].map(s=>(
                <div key={s} style={{flex:1,height:4,borderRadius:99,background:step>=s?'white':'rgba(255,255,255,.3)',transition:'all .3s'}}/>
              ))}
            </div>
          )}
        </div>

        {/* Role selector - only on step 1 */}
        {step === 1 && (
          <div style={{padding:'20px 36px 0'}}>
            <div style={{display:'flex',gap:8,background:'#F1F5F9',borderRadius:12,padding:4,marginBottom:20}}>
              {[
                {val:'patient',icon:'fa-user',label:'Patient'},
                {val:'doctor',icon:'fa-user-md',label:'Doctor'},
              ].map(r=>(
                <button key={r.val} onClick={()=>setRole(r.val)} style={{flex:1,padding:'9px',border:'none',borderRadius:9,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:600,cursor:'pointer',background:role===r.val?'white':'transparent',color:role===r.val?'#0D9B82':'#64748B',boxShadow:role===r.val?'0 1px 4px rgba(0,0,0,.1)':'none',transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                  <i className={'fas '+r.icon}/>{r.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{padding:step===1?'0 36px 32px':'20px 36px 32px'}}>
          {error && (
            <div style={{background:'#FFE4E6',color:'#9F1239',padding:'10px 14px',borderRadius:10,fontSize:13,marginBottom:16,fontWeight:600}}>
              <i className='fas fa-exclamation-circle' style={{marginRight:6}}/>{error}
            </div>
          )}

          {/* STEP 1 - Basic Info */}
          {step === 1 && (
            <form onSubmit={handleStep1}>
              <label style={lStyle}>Full Name *</label>
              <input style={iStyle} placeholder={role==='doctor'?'Dr. Your Name':'Your full name'} value={form.name} onChange={e=>set('name',e.target.value)} required/>

              <label style={lStyle}>Email Address *</label>
              <input style={iStyle} type='email' placeholder='your@email.com' value={form.email} onChange={e=>set('email',e.target.value)} required/>

              <label style={lStyle}>Phone Number</label>
              <input style={iStyle} placeholder='+91 98765 43210' value={form.phone} onChange={e=>set('phone',e.target.value)}/>

              <label style={lStyle}>Password *</label>
              <input style={iStyle} type='password' placeholder='Min 6 characters' value={form.password} onChange={e=>set('password',e.target.value)} required minLength={6}/>

              <button type='submit' disabled={loading} style={{width:'100%',padding:'13px',background:tg,color:'white',border:'none',borderRadius:12,fontFamily:'DM Sans,sans-serif',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(13,155,130,.3)'}}>
                {loading ? 'Creating...' : role==='doctor' ? 'Next: Doctor Profile' : 'Create Account'}
                <i className={'fas '+(role==='doctor'?'fa-arrow-right':'fa-check')} style={{marginLeft:8}}/>
              </button>
            </form>
          )}

          {/* STEP 2 - Doctor Profile */}
          {step === 2 && (
            <form onSubmit={submitRegister}>
              <label style={lStyle}>Speciality *</label>
              <select style={iStyle} value={form.speciality} onChange={e=>set('speciality',e.target.value)} required>
                <option value=''>Select speciality</option>
                {specialities.map(s=><option key={s} value={s}>{s}</option>)}
              </select>

              <label style={lStyle}>Qualification</label>
              <input style={iStyle} placeholder='e.g. MBBS, MD, MS' value={form.qualification} onChange={e=>set('qualification',e.target.value)}/>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <label style={lStyle}>Experience (years)</label>
                  <input style={iStyle} type='number' placeholder='e.g. 10' value={form.experience_years} onChange={e=>set('experience_years',e.target.value)} min={0}/>
                </div>
                <div>
                  <label style={lStyle}>Consultation Fee (Rs.)</label>
                  <input style={iStyle} type='number' placeholder='e.g. 500' value={form.consultation_fee} onChange={e=>set('consultation_fee',e.target.value)} min={0}/>
                </div>
              </div>

              <label style={lStyle}>Room Number</label>
              <input style={iStyle} placeholder='e.g. 204, OPD-3' value={form.room_number} onChange={e=>set('room_number',e.target.value)}/>

              <label style={lStyle}>Bio / About</label>
              <textarea style={{...iStyle,resize:'vertical'}} rows={3} placeholder='Brief description of your expertise...' value={form.bio} onChange={e=>set('bio',e.target.value)}/>

              <div style={{display:'flex',gap:10}}>
                <button type='button' onClick={()=>setStep(1)} style={{flex:1,padding:'12px',background:'#F1F5F9',color:'#64748B',border:'none',borderRadius:12,fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:600,cursor:'pointer'}}>
                  <i className='fas fa-arrow-left' style={{marginRight:6}}/> Back
                </button>
                <button type='submit' disabled={loading} style={{flex:2,padding:'12px',background:tg,color:'white',border:'none',borderRadius:12,fontFamily:'DM Sans,sans-serif',fontSize:15,fontWeight:700,cursor:'pointer'}}>
                  {loading ? 'Creating...' : 'Complete Registration'}
                  <i className='fas fa-check' style={{marginLeft:8}}/>
                </button>
              </div>
            </form>
          )}

          <div style={{textAlign:'center',marginTop:16,fontSize:13,color:'#64748B'}}>
            Already have an account?
            <Link to='/login' style={{color:'#0D9B82',fontWeight:700,textDecoration:'none',marginLeft:4}}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
