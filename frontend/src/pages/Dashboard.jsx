import { useTheme } from '../context/ThemeContext';
import ReviewsPanel from './panels/ReviewsPanel';
import React from 'react';
import HealthPanel from './panels/HealthPanel';
import MessagesPanel from './panels/MessagesPanel';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, appointmentAPI, doctorAPI } from '../services/api';
import AppointmentsPanel from './panels/AppointmentsPanel';
import QueuePanel from './panels/QueuePanel';
import AdminPanel from './panels/AdminPanel';
import PaymentsPanel from './panels/PaymentsPanel';
import PrescriptionsPanel from './panels/PrescriptionsPanel';
import ToastStack from '../components/ToastStack';
import Chatbot from '../components/Chatbot';

const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

// Role-based navigation  strictly separated
const NAV_CONFIG = {
  patient: [
    { id:'overview',       icon:'fa-home',                label:'Dashboard' },
    { id:'appointments',   icon:'fa-calendar-check',      label:'My Appointments' },
    { id:'queue',          icon:'fa-ticket-alt',           label:'Queue Status' },
    { id:'doctors',        icon:'fa-user-md',             label:'Find Doctors' },
    { id:'payments',       icon:'fa-credit-card',         label:'Payments' },
    { id:'prescriptions',  icon:'fa-prescription-bottle', label:'Prescriptions' },
    { id:'health',         icon:'fa-heart',               label:'Health Records' },
    { id:'reviews',        icon:'fa-star',                label:'Reviews' },
    { id:'messages',      icon:'fa-comments',             label:'Messages' },
    { id:'settings',       icon:'fa-cog',                 label:'Settings' },
  ],
  doctor: [
    { id:'overview',       icon:'fa-home',                label:'Dashboard' },
    { id:'appointments',   icon:'fa-calendar-alt',        label:'My Schedule' },
    { id:'queue',          icon:'fa-ticket-alt',           label:'Queue Management' },
    { id:'prescriptions',  icon:'fa-prescription-bottle', label:'E-Prescriptions' },
    { id:'messages',       icon:'fa-comments',            label:'Messages' },
    { id:'health',         icon:'fa-heart',               label:'Health Records' },
    { id:'reviews',        icon:'fa-star',                label:'My Reviews' },
    { id:'settings',       icon:'fa-cog',                 label:'Settings' },
  ],
  admin: [
    { id:'overview',       icon:'fa-home',                label:'Overview' },
    { id:'admin',          icon:'fa-chart-bar',           label:'Analytics' },
    { id:'appointments',   icon:'fa-calendar-alt',        label:'All Appointments' },
    { id:'doctors',        icon:'fa-user-md',             label:'Manage Doctors' },
    { id:'messages',      icon:'fa-comments',             label:'Messages' },
    { id:'settings',       icon:'fa-cog',                 label:'Settings' },
  ]
};

const PAGE_TITLES = {
  overview:'Dashboard', appointments:'Appointments', queue:'Queue',
  doctors:'Doctors', payments:'Payments', prescriptions:'Prescriptions',
  settings:'Settings', messages:'Messages', health:'Health Records', reviews:'Reviews', admin:'Analytics'
};

function Sidebar({ role, active, onNav, user, onLogout }) {
  const navItems = NAV_CONFIG[role] || NAV_CONFIG.patient;
  const roleColors = { patient:'#0D9B82', doctor:'#7C3AED', admin:'#F59E0B' };
  const roleColor = roleColors[role] || '#0D9B82';
  const roleBgs = { patient:'#E6F7F4', doctor:'#EDE9FE', admin:'#FEF3C7' };
  const roleBg = roleBgs[role] || '#E6F7F4';

  return (
    <aside style={{
      width:260, background:'var(--surface)',
      borderRight:'1px solid var(--border)',
      height:'100vh', display:'flex',
      flexDirection:'column', flexShrink:0,
      position:'fixed', top:0, left:0, zIndex:100
    }}>
      {/* Logo */}
      <div style={{padding:'20px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:36,height:36,background:tg,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <i className='fas fa-heart-pulse' style={{color:'#fff',fontSize:16}}/>
        </div>
        <div>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:15,background:tg,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:.5}}>MEDIQUEUE</div>
          <div style={{fontSize:9,color:'var(--text-3)',letterSpacing:.8,textTransform:'uppercase',fontWeight:600}}>Digital Queue System</div>
        </div>
      </div>

      {/* Role Badge */}
      <div style={{padding:'10px 14px',borderBottom:'1px solid var(--border)'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:99,background:roleBg,color:roleColor,fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>
          <i className={'fas '+(role==='patient'?'fa-user':role==='doctor'?'fa-user-md':'fa-crown')}/>
          {role} Portal
        </div>
      </div>

      {/* Nav Items */}
      <div style={{flex:1,padding:'12px 8px',overflowY:'auto'}}>
        {navItems.map(item => (
          <div
            key={item.id}
            onClick={() => onNav(item.id)}
            style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'10px 12px', borderRadius:10,
              cursor:'pointer', marginBottom:3,
              background: active===item.id ? '#E6F7F4' : 'transparent',
              color: active===item.id ? '#0D9B82' : 'var(--text-2)',
              fontWeight: active===item.id ? 600 : 500,
              fontSize:13, transition:'all .2s'
            }}
            onMouseEnter={e => { if(active!==item.id) e.currentTarget.style.background='var(--surface-2)'; }}
            onMouseLeave={e => { if(active!==item.id) e.currentTarget.style.background='transparent'; }}
          >
            <div style={{
              width:32, height:32, borderRadius:9, flexShrink:0,
              background: active===item.id ? tg : 'var(--surface-2)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, color: active===item.id ? '#fff' : 'var(--text-3)'
            }}>
              <i className={'fas '+item.icon}/>
            </div>
            {item.label}
          </div>
        ))}
      </div>

      {/* User + Logout */}
      <div style={{padding:'12px 8px',borderTop:'1px solid var(--border)'}}>
        <div style={{display:'flex',alignItems:'center',gap:9,padding:'10px 12px',borderRadius:10,background:'var(--surface-2)',marginBottom:6}}>
          <div style={{width:34,height:34,borderRadius:9,background:tg,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:12,flexShrink:0}}>
            {user?.name?.slice(0,2).toUpperCase()||'??'}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:700,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name}</div>
            <div style={{fontSize:10,color:'var(--text-3)',textTransform:'capitalize'}}>{user?.email}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            width:'100%', display:'flex', alignItems:'center',
            justifyContent:'center', gap:8, padding:'9px 12px',
            borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:600,
            background:'#FFE4E6', color:'#9F1239', border:'none',
            transition:'all .2s'
          }}
          onMouseEnter={e=>e.currentTarget.style.background='#FECDD3'}
          onMouseLeave={e=>e.currentTarget.style.background='#FFE4E6'}
        >
          <i className='fas fa-sign-out-alt'/>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function OverviewPanel({ role, user }) {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (role === 'admin') {
          const r = await adminAPI.getStats();
          setStats(r.data);
        }
        const r2 = await appointmentAPI.getAll();
        setAppointments(r2.data.appointments || []);
        if (role === 'patient') {
          const r3 = await doctorAPI.getAll();
          setDoctors(r3.data.doctors || []);
        }
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [role]);

  if (loading) return (
    <div style={{padding:60,textAlign:'center'}}>
      <i className='fas fa-spinner fa-spin' style={{fontSize:32,color:'#0D9B82',display:'block',marginBottom:12}}/>
      <div style={{color:'var(--text-3)',fontSize:14}}>Loading dashboard...</div>
    </div>
  );

  const upcoming = appointments.filter(a => a.status === 'confirmed').slice(0,3);
  const today = new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  // PATIENT DASHBOARD
  if (role === 'patient') return (
    <div className='fu'>
      <div style={{marginBottom:24,padding:'20px 24px',background:tg,borderRadius:20,color:'white',position:'relative',overflow:'visible'}}>
        <div style={{position:'absolute',top:-30,right:-30,width:150,height:150,borderRadius:'50%',background:'rgba(255,255,255,.08)'}}/>
        <div style={{position:'absolute',bottom:-40,right:40,width:100,height:100,borderRadius:'50%',background:'rgba(255,255,255,.06)'}}/>
        <div style={{fontSize:12,opacity:.8,marginBottom:4}}>{today}</div>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700,marginBottom:4}}>Good {new Date().getHours()<12?'Morning':new Date().getHours()<17?'Afternoon':'Evening'}, {user?.name?.split(' ')[0]}!!</div>
        <div style={{fontSize:13,opacity:.85}}>You have {upcoming.length} upcoming appointment{upcoming.length!==1?'s':''}</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:24}}>
        {[
          {label:'Upcoming',val:upcoming.length,icon:'calendar-check',color:'#0D9B82',bg:'#E6F7F4'},
          {label:'Total Visits',val:appointments.length,icon:'history',color:'#7C3AED',bg:'#EDE9FE'},
          {label:'Prescriptions',val:'View',icon:'prescription-bottle',color:'#F59E0B',bg:'#FEF3C7'},
        ].map(m=>(
          <div key={m.label} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:'18px 20px',position:'relative',overflow:'visible'}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:.6,marginBottom:6}}>{m.label}</div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:36,fontWeight:800,color:m.color,lineHeight:1,marginBottom:4}}>{m.val}</div>
            <div style={{position:'absolute',top:14,right:14,width:36,height:36,borderRadius:10,background:m.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,color:m.color}}>
              <i className={'fas fa-'+m.icon}/>
            </div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}}>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            Upcoming Appointments
            <span style={{fontSize:11,padding:'3px 10px',borderRadius:99,background:'#E6F7F4',color:'#0D9B82',fontWeight:700}}>{upcoming.length}</span>
          </div>
          {upcoming.length === 0 ? (
            <div style={{textAlign:'center',padding:'30px 0',color:'var(--text-3)'}}>
              <i className='fas fa-calendar-plus' style={{fontSize:32,display:'block',marginBottom:10}}/>
              <div style={{fontSize:13,marginBottom:12}}>No upcoming appointments</div>
            </div>
          ) : upcoming.map((a,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px',background:'var(--surface-2)',borderRadius:12,marginBottom:8}}>
              <div style={{width:44,height:44,borderRadius:12,background:tg,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:13,flexShrink:0}}>
                {a.doctor_name?.slice(0,2)||'Dr'}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600}}>{a.doctor_name||'Doctor'}</div>
                <div style={{fontSize:11,color:'var(--text-3)'}}>{new Date(a.appointment_time).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</div>
              </div>
              <span style={{fontSize:11,padding:'3px 9px',borderRadius:99,fontWeight:700,background:'#D1FAE5',color:'#065F46'}}>{a.status}</span>
            </div>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,marginBottom:12}}>Quick Actions</div>
            {[
              {icon:'fa-calendar-plus',label:'Book Appointment',color:'#0D9B82',bg:'#E6F7F4'},
              {icon:'fa-ticket-alt',label:'Check Queue',color:'#7C3AED',bg:'#EDE9FE'},
              {icon:'fa-prescription-bottle',label:'My Prescriptions',color:'#F59E0B',bg:'#FEF3C7'},
            ].map(a=>(
              <div key={a.label} style={{display:'flex',alignItems:'center',gap:10,padding:'10px',borderRadius:10,cursor:'pointer',marginBottom:6,border:'1px solid var(--border)',transition:'all .2s'}}
                onMouseEnter={e=>e.currentTarget.style.background=a.bg}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{width:32,height:32,borderRadius:8,background:a.bg,display:'flex',alignItems:'center',justifyContent:'center',color:a.color}}>
                  <i className={'fas '+a.icon}/>
                </div>
                <span style={{fontSize:13,fontWeight:500}}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // DOCTOR DASHBOARD
  if (role === 'doctor') return (
    <div className='fu'>
      <div style={{marginBottom:24,padding:'20px 24px',background:'linear-gradient(135deg,#7C3AED,#A78BFA)',borderRadius:20,color:'white',position:'relative',overflow:'visible'}}>
        <div style={{position:'absolute',top:-30,right:-30,width:150,height:150,borderRadius:'50%',background:'rgba(255,255,255,.08)'}}/>
        <div style={{fontSize:12,opacity:.8,marginBottom:4}}>{today}</div>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700,marginBottom:4}}>Welcome, {user?.name}!</div>
        <div style={{fontSize:13,opacity:.85}}>You have {appointments.length} appointment{appointments.length!==1?'s':''} scheduled</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:24}}>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:'20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
            <div style={{width:36,height:36,borderRadius:10,background:'#EDE9FE',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <i className='fas fa-users' style={{color:'#7C3AED',fontSize:16}}/>
            </div>
            <div style={{fontSize:12,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:.5}}>Today</div>
          </div>
          <div style={{fontSize:42,fontWeight:900,color:'#7C3AED',fontFamily:'DM Sans,sans-serif',letterSpacing:-1}}>
            {String(appointments.filter(a=>new Date(a.appointment_time).toDateString()===new Date().toDateString()).length)}
          </div>
          <div style={{fontSize:12,color:'var(--text-3)',marginTop:2}}>patients today</div>
        </div>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:'20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
            <div style={{width:36,height:36,borderRadius:10,background:'#E6F7F4',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <i className='fas fa-calendar-check' style={{color:'#0D9B82',fontSize:16}}/>
            </div>
            <div style={{fontSize:12,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:.5}}>Confirmed</div>
          </div>
          <div style={{fontSize:42,fontWeight:900,color:'#0D9B82',fontFamily:'DM Sans,sans-serif',letterSpacing:-1}}>
            {String(appointments.filter(a=>a.status==='confirmed').length)}
          </div>
          <div style={{fontSize:12,color:'var(--text-3)',marginTop:2}}>appointments</div>
        </div>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:'20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
            <div style={{width:36,height:36,borderRadius:10,background:'#FEF3C7',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <i className='fas fa-check-circle' style={{color:'#F59E0B',fontSize:16}}/>
            </div>
            <div style={{fontSize:12,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:.5}}>Completed</div>
          </div>
          <div style={{fontSize:42,fontWeight:900,color:'#F59E0B',fontFamily:'DM Sans,sans-serif',letterSpacing:-1}}>
            {String(appointments.filter(a=>a.status==='completed').length)}
          </div>
          <div style={{fontSize:12,color:'var(--text-3)',marginTop:2}}>total done</div>
        </div>
      </div>

      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,marginBottom:16}}>Today Schedule</div>
        {appointments.filter(a=>new Date(a.appointment_time).toDateString()===new Date().toDateString()).length === 0 ? (
          <div style={{textAlign:'center',padding:'30px 0',color:'var(--text-3)'}}>
            <i className='fas fa-calendar' style={{fontSize:32,display:'block',marginBottom:10}}/>
            <div style={{fontSize:13}}>No appointments today</div>
          </div>
        ) : appointments.filter(a=>new Date(a.appointment_time).toDateString()===new Date().toDateString()).map((a,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:12,background:'var(--surface-2)',borderRadius:12,marginBottom:8}}>
            <div style={{width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#7C3AED,#A78BFA)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:13}}>
              {a.patient_name?.slice(0,2)||'P'}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600}}>{a.patient_name}</div>
              <div style={{fontSize:11,color:'var(--text-3)'}}>{new Date(a.appointment_time).toLocaleTimeString('en-IN',{timeStyle:'short'})}  {a.type}</div>
            </div>
            <span style={{fontSize:11,padding:'3px 9px',borderRadius:99,fontWeight:700,background:'#D1FAE5',color:'#065F46'}}>{a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ADMIN DASHBOARD
  if (role === 'admin') return (
    <div className='fu'>
      <div style={{marginBottom:24,padding:'20px 24px',background:'linear-gradient(135deg,#F59E0B,#FCD34D)',borderRadius:20,color:'var(--text)',position:'relative',overflow:'visible'}}>
        <div style={{position:'absolute',top:-30,right:-30,width:150,height:150,borderRadius:'50%',background:'rgba(0,0,0,.06)'}}/>
        <div style={{fontSize:12,opacity:.7,marginBottom:4}}>{today}</div>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700,marginBottom:4}}>Admin Dashboard</div>
        <div style={{fontSize:13,opacity:.8}}>{stats?.totalPatients||0} patients  {stats?.activeDoctors||0} doctors  {stats?.todayAppointments||0} appointments today</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:'20px',display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:48,height:48,borderRadius:14,background:'#E6F7F4',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><i className='fas fa-users' style={{color:'#0D9B82',fontSize:20}}/></div>
          <div><div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:.6,marginBottom:4}}>Total Patients</div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:32,fontWeight:800,color:'#0D9B82',lineHeight:1}}>{stats?.totalPatients||0}</div></div>
        </div>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:'20px',display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:48,height:48,borderRadius:14,background:'#EDE9FE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><i className='fas fa-user-md' style={{color:'#7C3AED',fontSize:20}}/></div>
          <div><div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:.6,marginBottom:4}}>Active Doctors</div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:32,fontWeight:800,color:'#7C3AED',lineHeight:1}}>{stats?.activeDoctors||0}</div></div>
        </div>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:'20px',display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:48,height:48,borderRadius:14,background:'#FEF3C7',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><i className='fas fa-calendar' style={{color:'#F59E0B',fontSize:20}}/></div>
          <div><div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:.6,marginBottom:4}}>Today Appts</div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:32,fontWeight:800,color:'#F59E0B',lineHeight:1}}>{stats?.todayAppointments||0}</div></div>
        </div>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:'20px',display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:48,height:48,borderRadius:14,background:'#FFE4E6',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><i className='fas fa-indian-rupee-sign' style={{color:'#F43F5E',fontSize:20}}/></div>
          <div><div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:.6,marginBottom:4}}>Revenue</div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:28,fontWeight:800,color:'#F43F5E',lineHeight:1}}>Rs.{stats?.totalRevenue?Math.round(stats.totalRevenue).toLocaleString():'0'}</div></div>
        </div>
      </div>

      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,marginBottom:16}}>Recent Appointments</div>
        {appointments.slice(0,5).map((a,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:12,borderBottom:'1px solid var(--border)'}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600}}>{a.patient_name} to {a.doctor_name}</div>
              <div style={{fontSize:11,color:'var(--text-3)'}}>{new Date(a.appointment_time).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</div>
            </div>
            <span style={{fontSize:11,padding:'3px 9px',borderRadius:99,fontWeight:700,background:a.status==='confirmed'?'#D1FAE5':a.status==='cancelled'?'#FFE4E6':'#FEF3C7',color:a.status==='confirmed'?'#065F46':a.status==='cancelled'?'#9F1239':'#92400E'}}>{a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return null;
}

function SettingsPanel({ user }) {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { default: api } = await import('../services/api');
      await api.put('/auth/profile', { name, phone });
      const { toast } = await import('../components/ToastStack');
      toast('Profile updated successfully!', 'success');
    } catch(e) {
      console.error(e);
      const { toast } = await import('../components/ToastStack');
      toast('Failed to save', 'error');
    } finally { setSaving(false); }
  };

  return (
    <div className='fu'>
      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:24,maxWidth:600}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,marginBottom:20}}>Account Settings</div>
        <div style={{display:'flex',alignItems:'center',gap:16,padding:20,background:'var(--surface-2)',borderRadius:14,marginBottom:24}}>
          <div style={{width:64,height:64,borderRadius:16,background:'linear-gradient(135deg,#0D9B82,#1DBEA0)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:24,flexShrink:0}}>
            {user?.name?.slice(0,2).toUpperCase()}
          </div>
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700}}>{user?.name}</div>
            <div style={{fontSize:13,color:'var(--text-2)'}}>{user?.email}</div>
            <span style={{fontSize:11,padding:'3px 10px',borderRadius:99,fontWeight:700,background:'#E6F7F4',color:'#0D9B82',textTransform:'capitalize',marginTop:4,display:'inline-block'}}>{user?.role}</span>
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--text-2)',marginBottom:5,textTransform:'uppercase',letterSpacing:.4}}>Full Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} type='text' style={{width:'100%',padding:'11px 14px',background:'#F8FAFC',border:'1.5px solid #E2E8F0',borderRadius:10,fontSize:14,color:'var(--text)',outline:'none',fontFamily:'DM Sans,sans-serif'}}/>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--text-2)',marginBottom:5,textTransform:'uppercase',letterSpacing:.4}}>Email</label>
          <input value={user?.email} disabled type='email' style={{width:'100%',padding:'11px 14px',background:'#F1F5F9',border:'1.5px solid #E2E8F0',borderRadius:10,fontSize:14,color:'var(--text-3)',outline:'none',fontFamily:'DM Sans,sans-serif',cursor:'not-allowed'}}/>
          <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>Email cannot be changed</div>
        </div>
        <div style={{marginBottom:24}}>
          <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--text-2)',marginBottom:5,textTransform:'uppercase',letterSpacing:.4}}>Phone</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} type='tel' placeholder='+91 98765 43210' style={{width:'100%',padding:'11px 14px',background:'#F8FAFC',border:'1.5px solid #E2E8F0',borderRadius:10,fontSize:14,color:'var(--text)',outline:'none',fontFamily:'DM Sans,sans-serif'}}/>
        </div>
        <button onClick={save} disabled={saving} style={{padding:'11px 28px',background:'linear-gradient(135deg,#0D9B82,#1DBEA0)',color:'white',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:700,cursor:'pointer',opacity:saving?0.7:1}}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const role = user?.role || 'patient';
  const [panel, setPanel] = useState('overview');
  const { dark, toggle: toggleDark } = useTheme();

  const renderPanel = () => {
    switch(panel) {
      case 'overview':      return <OverviewPanel role={role} user={user}/>;
      case 'appointments':  return <AppointmentsPanel role={role}/>;
      case 'queue':         return <QueuePanel role={role}/>;
      case 'payments':      return role==='patient' ? <PaymentsPanel/> : <div style={{padding:40,textAlign:'center',color:'var(--text-3)'}}>Access denied</div>;
      case 'prescriptions': return <PrescriptionsPanel role={role}/>;
      case 'admin':         return role==='admin' ? <AdminPanel/> : <div style={{padding:40,textAlign:'center',color:'var(--text-3)'}}>Access denied</div>;
      case 'doctors':       return role==='admin' ? <AdminDoctorsPanel/> : <FindDoctorsPanel/>;
      case 'settings':      return <SettingsPanel user={user}/>;
      case 'messages':      return <MessagesPanel/>;
      case 'health':        return <HealthPanel/>;
      case 'reviews':       return <ReviewsPanel role={role}/>;
      default:              return <OverviewPanel role={role} user={user}/>;
    }
  };

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#F8FAFC'}}>
      <ToastStack/>
      <Sidebar role={role} active={panel} onNav={setPanel} user={user} onLogout={logout}/>

      <div style={{marginLeft:260,flex:1,display:'flex',flexDirection:'column',minHeight:'100vh',background:'var(--bg)'}}>
        {/* Topbar */}
        <div style={{height:60,padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'var(--surface)',borderBottom:'1px solid var(--border)',position:'sticky',top:0,zIndex:50}}>
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700}}>{PAGE_TITLES[panel]||panel}</div>
            <div style={{fontSize:11,color:'var(--text-3)'}}>Welcome back, {user?.name}!</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <button onClick={toggleDark} style={{width:36,height:36,borderRadius:9,background:'var(--surface-2)',border:'1px solid var(--border)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-2)',fontSize:14}}>
              <span style={{fontSize:18}}>{dark ? '☀' : '☽'}</span>
            </button>
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'6px 12px',background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:10}}>
              <div style={{width:28,height:28,borderRadius:7,background:'linear-gradient(135deg,#0D9B82,#1DBEA0)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:11}}>
                {user?.name?.slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{user?.name}</div>
                <div style={{fontSize:10,color:'var(--text-3)',textTransform:'capitalize'}}>{role}</div>
              </div>
            </div>
            <button onClick={logout} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'#FFE4E6',color:'#9F1239',border:'none',borderRadius:9,cursor:'pointer',fontSize:12,fontWeight:700}}>
              <i className='fas fa-sign-out-alt'/> Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{flex:1,padding:24,overflowY:'auto',background:'var(--bg)'}}>
          {renderPanel()}
        </div>
      </div>

      <Chatbot/>
    </div>
  );
}

function FindDoctorsPanel() {
  const [doctors, setDoctors] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [booking, setBooking] = React.useState(null);
  const [apptDate, setApptDate] = React.useState('');
  const [apptTime, setApptTime] = React.useState('');
  const [apptType, setApptType] = React.useState('in_person');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(()=>{
    doctorAPI.getAll().then(r=>setDoctors(r.data.doctors||[])).catch(console.error).finally(()=>setLoading(false));
  },[]);

  const bookAppointment = async () => {
    if (!apptDate || !apptTime) { alert('Please select date and time'); return; }
    setSubmitting(true);
    try {
      const { appointmentAPI } = await import('../services/api');
      const { toast } = await import('../components/ToastStack');
      await appointmentAPI.book({
        doctor_id: booking.id,
        appointment_time: apptDate + 'T' + apptTime + ':00',
        type: apptType,
        notes: ''
      });
      toast('Appointment booked successfully!', 'success');
      setBooking(null);
      setApptDate('');
      setApptTime('');
    } catch(e) {
      const { toast } = await import('../components/ToastStack');
      toast(e.response?.data?.message || 'Booking failed', 'error');
    } finally { setSubmitting(false); }
  };

  const timeSlots = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30'];
  const today = new Date().toISOString().split('T')[0];

  if(loading) return <div style={{padding:40,textAlign:'center'}}><i className='fas fa-spinner fa-spin' style={{fontSize:32,color:'#0D9B82'}}/></div>;
  return (
    <div className='fu'>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
        {doctors.map(d=>(
          <div key={d.id} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20,overflow:'hidden',transition:'all .2s',boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}
            onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
            onMouseLeave={e=>e.currentTarget.style.transform='none'}>
            <div style={{background:'linear-gradient(135deg,#0D9B82,#1DBEA0)',padding:'24px',textAlign:'center'}}>
              <div style={{width:64,height:64,borderRadius:18,background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:22,margin:'0 auto 12px'}}>
                {d.name?.slice(0,2)||'Dr'}
              </div>
              <div style={{fontWeight:700,fontSize:16,color:'white',marginBottom:4}}>{d.name}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.8)'}}>{d.speciality}</div>
            </div>
            <div style={{padding:'16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
                <div style={{textAlign:'center',flex:1}}>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,color:'#0D9B82'}}>Rs.{d.consultation_fee}</div>
                  <div style={{fontSize:11,color:'var(--text-3)'}}>Fee</div>
                </div>
                <div style={{width:1,background:'#E2E8F0'}}/>
                <div style={{textAlign:'center',flex:1}}>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,color:'#F59E0B'}}>{d.rating||'4.9'}</div>
                  <div style={{fontSize:11,color:'var(--text-3)'}}>Rating</div>
                </div>
                <div style={{width:1,background:'#E2E8F0'}}/>
                <div style={{textAlign:'center',flex:1}}>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,color:'#7C3AED'}}>{d.experience_years||'5'}yr</div>
                  <div style={{fontSize:11,color:'var(--text-3)'}}>Exp</div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:14}}>
                <span style={{width:8,height:8,borderRadius:'50%',background:d.is_available?'#10B981':'#F43F5E',display:'inline-block'}}/>
                <span style={{fontSize:12,color:d.is_available?'#10B981':'#F43F5E',fontWeight:600}}>{d.is_available?'Available Now':'Unavailable'}</span>
              </div>
              <button
                onClick={()=>setBooking(d)}
                disabled={!d.is_available}
                style={{width:'100%',padding:'11px',background:d.is_available?'linear-gradient(135deg,#0D9B82,#1DBEA0)':'#F1F5F9',color:d.is_available?'white':'#94A3B8',border:'none',borderRadius:12,fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:700,cursor:d.is_available?'pointer':'not-allowed',transition:'all .2s'}}
              >
                <i className='fas fa-calendar-plus' style={{marginRight:7}}/>
                {d.is_available ? 'Book Appointment' : 'Unavailable'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {booking && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}>
          <div style={{background:'white',borderRadius:24,width:'100%',maxWidth:460,overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,.2)'}}>
            <div style={{background:'linear-gradient(135deg,#0D9B82,#1DBEA0)',padding:'24px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700,color:'white'}}>Book Appointment</div>
                  <div style={{fontSize:13,color:'rgba(255,255,255,.8)',marginTop:2}}>with {booking.name}</div>
                </div>
                <button onClick={()=>setBooking(null)} style={{width:32,height:32,borderRadius:8,background:'rgba(255,255,255,.2)',border:'none',color:'white',cursor:'pointer',fontSize:16}}>x</button>
              </div>
            </div>
            <div style={{padding:24}}>
              <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px',background:'var(--surface-2)',borderRadius:12,marginBottom:20}}>
                <div style={{width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#0D9B82,#1DBEA0)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:16}}>
                  {booking.name?.slice(0,2)}
                </div>
                <div>
                  <div style={{fontWeight:600,fontSize:14}}>{booking.name}</div>
                  <div style={{fontSize:12,color:'var(--text-3)'}}>{booking.speciality} - Rs.{booking.consultation_fee}</div>
                </div>
              </div>

              <div style={{marginBottom:16}}>
                <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--text-2)',marginBottom:6,textTransform:'uppercase',letterSpacing:.4}}>Appointment Type</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[{val:'in_person',label:'In Person',icon:'fa-hospital'},{val:'telehealth',label:'Telehealth',icon:'fa-video'}].map(t=>(
                    <button key={t.val} onClick={()=>setApptType(t.val)} style={{padding:'10px',border:'2px solid',borderColor:apptType===t.val?'#0D9B82':'#E2E8F0',borderRadius:10,background:apptType===t.val?'#E6F7F4':'white',color:apptType===t.val?'#0D9B82':'#64748B',fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
                      <i className={'fas '+t.icon}/>{t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{marginBottom:16}}>
                <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--text-2)',marginBottom:6,textTransform:'uppercase',letterSpacing:.4}}>Select Date</label>
                <input type='date' min={today} value={apptDate} onChange={e=>setApptDate(e.target.value)}
                  style={{width:'100%',padding:'11px 14px',background:'#F8FAFC',border:'1.5px solid #E2E8F0',borderRadius:10,fontSize:14,color:'var(--text)',outline:'none',fontFamily:'DM Sans,sans-serif'}}/>
              </div>

              <div style={{marginBottom:20}}>
                <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--text-2)',marginBottom:6,textTransform:'uppercase',letterSpacing:.4}}>Select Time</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
                  {timeSlots.map(t=>(
                    <button key={t} onClick={()=>setApptTime(t)} style={{padding:'8px 4px',border:'1.5px solid',borderColor:apptTime===t?'#0D9B82':'#E2E8F0',borderRadius:8,background:apptTime===t?'#E6F7F4':'white',color:apptTime===t?'#0D9B82':'#64748B',fontFamily:'DM Sans,sans-serif',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>setBooking(null)} style={{flex:1,padding:'12px',background:'#F1F5F9',color:'var(--text-2)',border:'none',borderRadius:12,fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:600,cursor:'pointer'}}>
                  Cancel
                </button>
                <button onClick={bookAppointment} disabled={submitting||!apptDate||!apptTime}
                  style={{flex:2,padding:'12px',background:'linear-gradient(135deg,#0D9B82,#1DBEA0)',color:'white',border:'none',borderRadius:12,fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:700,cursor:'pointer',opacity:submitting||!apptDate||!apptTime?0.7:1}}>
                  <i className='fas fa-calendar-check' style={{marginRight:7}}/>
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function AdminDoctorsPanel() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    doctorAPI.getAll().then(r=>setDoctors(r.data.doctors||[])).catch(console.error).finally(()=>setLoading(false));
  },[]);
  if(loading) return <div style={{padding:40,textAlign:'center'}}><i className='fas fa-spinner fa-spin' style={{fontSize:32,color:'#0D9B82'}}/></div>;
  return (
    <div className='fu'>
      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,overflow:'visible'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700}}>All Doctors ({doctors.length})</div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'var(--surface-2)'}}>
              {['Name','Speciality','Fee','Rating','Status'].map(h=>(
                <th key={h} style={{padding:'11px 16px',textAlign:'left',fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:.6}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {doctors.map((d,i)=>(
              <tr key={i} style={{borderTop:'1px solid var(--border)'}}>
                <td style={{padding:'13px 16px',fontWeight:600,fontSize:14}}>{d.name}</td>
                <td style={{padding:'13px 16px',fontSize:13,color:'var(--text-2)'}}>{d.speciality}</td>
                <td style={{padding:'13px 16px',fontSize:13}}>Rs.{d.consultation_fee}</td>
                <td style={{padding:'13px 16px',fontSize:13}}>{d.rating||'4.9'}</td>
                <td style={{padding:'13px 16px'}}>
                  <span style={{fontSize:11,padding:'3px 9px',borderRadius:99,fontWeight:700,background:d.is_available?'#D1FAE5':'#FFE4E6',color:d.is_available?'#065F46':'#9F1239'}}>
                    {d.is_available?'Available':'Unavailable'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
