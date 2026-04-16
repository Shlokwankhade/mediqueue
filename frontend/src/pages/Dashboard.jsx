import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, appointmentAPI, doctorAPI } from '../services/api';
import { useEffect } from 'react';
import AppointmentsPanel from './panels/AppointmentsPanel';
import QueuePanel from './panels/QueuePanel';
import AdminPanel from './panels/AdminPanel';
import PaymentsPanel from './panels/PaymentsPanel';
import ToastStack from '../components/ToastStack';
import Chatbot from '../components/Chatbot';
const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

function Sidebar({ role, active, onNav, user, onLogout }) {
  const navs = {
    patient: [
      { id:'overview', icon:'fa-home', label:'Dashboard' },
      { id:'appointments', icon:'fa-calendar-check', label:'Appointments' },
      { id:'queue', icon:'fa-ticket-alt', label:'Queue Status' },
      { id:'doctors', icon:'fa-user-md', label:'Find Doctors' },
      { id:'payments', icon:'fa-credit-card', label:'Payments' },
      { id:'settings', icon:'fa-cog', label:'Settings' }
    ],
    doctor: [
      { id:'overview', icon:'fa-home', label:'Dashboard' },
      { id:'queue', icon:'fa-ticket-alt', label:'Queue Mgmt' },
      { id:'appointments', icon:'fa-calendar-alt', label:'Schedule' },
      { id:'settings', icon:'fa-cog', label:'Settings' }
    ],
    admin: [
      { id:'overview', icon:'fa-home', label:'Overview' },
      { id:'admin', icon:'fa-chart-bar', label:'Analytics' },
      { id:'appointments', icon:'fa-calendar-alt', label:'Appointments' },
      { id:'doctors', icon:'fa-user-md', label:'Doctors' },
      { id:'settings', icon:'fa-cog', label:'Settings' }
    ]
  };
  return (
    <aside style={{width:250,background:'var(--surf)',borderRight:'1px solid var(--bdr)',height:'100vh',display:'flex',flexDirection:'column',flexShrink:0}}>
      <div style={{padding:'18px 14px',borderBottom:'1px solid var(--bdr)',display:'flex',alignItems:'center',gap:9}}>
        <div style={{width:32,height:32,background:tg,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center'}}><i className='fas fa-heart-pulse' style={{color:'#fff',fontSize:14}}/></div>
        <span style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:16,background:tg,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>MEDIQUEUE</span>
      </div>
      <div style={{flex:1,padding:'10px 8px',overflowY:'auto'}}>
        {(navs[role]||navs.patient).map(item=>(
          <div key={item.id} onClick={()=>onNav(item.id)} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 11px',borderRadius:10,cursor:'pointer',marginBottom:2,background:active===item.id?'var(--tealXL)':'transparent',color:active===item.id?'var(--teal)':'var(--txt2)',fontWeight:active===item.id?600:500,fontSize:13,transition:'all .2s'}}>
            <div style={{width:30,height:30,borderRadius:8,background:active===item.id?tg:'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:active===item.id?'#fff':'inherit'}}><i className={'fas '+item.icon}/></div>
            {item.label}
          </div>
        ))}
      </div>
      <div style={{padding:'10px 8px',borderTop:'1px solid var(--bdr)'}}>
        <div onClick={onLogout} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 11px',borderRadius:10,cursor:'pointer',color:'var(--txt2)',fontSize:13,transition:'all .2s'}} onMouseEnter={e=>e.currentTarget.style.background='var(--surf2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
          <div style={{width:32,height:32,borderRadius:9,background:tg,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:13,flexShrink:0}}>{user?.name?.slice(0,2).toUpperCase()}</div>
          <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{user?.name}</div><div style={{fontSize:10,color:'var(--txt3)',textTransform:'capitalize'}}>{user?.role}</div></div>
          <i className='fas fa-sign-out-alt' style={{fontSize:13}}/>
        </div>
      </div>
    </aside>
  );
}

function MetricCard({ label, val, icon, color='#0D9B82', bg='#E6F7F4' }) {
  return (
    <div style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:16,padding:'18px 20px',position:'relative',overflow:'hidden'}}>
      <div style={{fontSize:11,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.6,marginBottom:7}}>{label}</div>
      <div style={{fontFamily:'Syne,sans-serif',fontSize:28,fontWeight:700}}>{val}</div>
      <div style={{position:'absolute',top:14,right:14,width:38,height:38,borderRadius:10,background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color}}><i className={'fas fa-'+icon}/></div>
    </div>
  );
}

function OverviewPanel({ role }) {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = async () => {
      try {
        if (role==='admin') { const r=await adminAPI.getStats(); setStats(r.data.stats); }
        const r2=await appointmentAPI.getAll(); setAppointments(r2.data.appointments||[]);
      } catch(e){console.error(e);} finally{setLoading(false);}
    };
    load();
  }, [role]);
  if (loading) return <div style={{padding:40,color:'var(--txt2)',fontSize:14}}>Loading...</div>;
  return (
    <div className='fu'>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
        {role==='admin'&&stats&&<>
          <MetricCard label='Total Patients' val={stats.totalPatients} icon='users' color='#0D9B82' bg='#E6F7F4'/>
          <MetricCard label='Active Doctors' val={stats.activeDoctors} icon='user-md' color='#7C3AED' bg='#EDE9FE'/>
          <MetricCard label="Today's Appts" val={stats.todayAppointments} icon='calendar-check' color='#F59E0B' bg='#FEF3C7'/>
          <MetricCard label='Queue Size' val={stats.currentQueueSize} icon='ticket-alt' color='#F43F5E' bg='#FFE4E6'/>
        </>}
        {role==='patient'&&<>
          <MetricCard label='Total Appointments' val={appointments.length} icon='calendar-check' color='#0D9B82' bg='#E6F7F4'/>
          <MetricCard label='Upcoming' val={appointments.filter(a=>a.status==='confirmed').length} icon='clock' color='#7C3AED' bg='#EDE9FE'/>
          <MetricCard label='Completed' val={appointments.filter(a=>a.status==='completed').length} icon='check-circle' color='#10B981' bg='#D1FAE5'/>
          <MetricCard label='Cancelled' val={appointments.filter(a=>a.status==='cancelled').length} icon='times-circle' color='#F43F5E' bg='#FFE4E6'/>
        </>}
        {role==='doctor'&&<>
          <MetricCard label="Today's Patients" val={appointments.length} icon='users' color='#0D9B82' bg='#E6F7F4'/>
          <MetricCard label='Confirmed' val={appointments.filter(a=>a.status==='confirmed').length} icon='calendar-check' color='#7C3AED' bg='#EDE9FE'/>
          <MetricCard label='Completed' val={appointments.filter(a=>a.status==='completed').length} icon='check-circle' color='#10B981' bg='#D1FAE5'/>
          <MetricCard label='Pending' val={appointments.filter(a=>a.status==='pending').length} icon='clock' color='#F59E0B' bg='#FEF3C7'/>
        </>}
      </div>
      <div style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:16,padding:22}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,marginBottom:16}}>Recent Appointments</div>
        {appointments.length===0?(
          <div style={{textAlign:'center',padding:'32px 0',color:'var(--txt3)',fontSize:14}}><i className='fas fa-calendar' style={{fontSize:36,display:'block',marginBottom:12}}/>No appointments yet</div>
        ):(
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Date & Time',role==='doctor'?'Patient':'Doctor','Type','Status'].map(h=>(
              <th key={h} style={{fontSize:11,fontWeight:700,letterSpacing:.7,textTransform:'uppercase',color:'var(--txt3)',padding:'9px 12px',borderBottom:'1px solid var(--bdr)',textAlign:'left'}}>{h}</th>
            ))}</tr></thead>
            <tbody>{appointments.slice(0,6).map((a,i)=>(
              <tr key={i} style={{borderBottom:'1px solid var(--bdr)'}} onMouseEnter={e=>e.currentTarget.style.background='var(--surf2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'12px',fontSize:13,fontWeight:600}}>{new Date(a.appointment_time).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</td>
                <td style={{padding:'12px',fontSize:13}}>{role==='doctor'?a.patient_name:a.doctor_name||'—'}</td>
                <td style={{padding:'12px'}}><span style={{fontSize:11,padding:'3px 9px',borderRadius:99,fontWeight:700,background:a.type==='telehealth'?'#EDE9FE':'#DBEAFE',color:a.type==='telehealth'?'#5B21B6':'#1E40AF'}}>{a.type}</span></td>
                <td style={{padding:'12px'}}><span style={{fontSize:11,padding:'3px 9px',borderRadius:99,fontWeight:700,background:a.status==='confirmed'?'#D1FAE5':a.status==='completed'?'#E6F7F4':'#FFE4E6',color:a.status==='confirmed'?'#065F46':a.status==='completed'?'#0A7A67':'#9F1239'}}>{a.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function DoctorsPanel() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ doctorAPI.getAll().then(r=>setDoctors(r.data.doctors||[])).catch(console.error).finally(()=>setLoading(false)); },[]);
  if (loading) return <div style={{padding:40,color:'var(--txt2)',fontSize:14}}>Loading doctors...</div>;
  return (
    <div className='fu' style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:16}}>
      {doctors.length===0?(
        <div style={{gridColumn:'1/-1',textAlign:'center',padding:48,color:'var(--txt3)'}}><i className='fas fa-user-md' style={{fontSize:40,display:'block',marginBottom:12}}/>No doctors found</div>
      ):doctors.map(d=>(
        <div key={d.id} style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:16,padding:22,textAlign:'center',transition:'all .2s'}} onMouseEnter={e=>e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.1)'} onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
          <div style={{width:64,height:64,borderRadius:16,background:tg,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:22,color:'#fff',margin:'0 auto 12px'}}>{d.name?.slice(0,2).toUpperCase()}</div>
          <div style={{fontWeight:700,fontSize:14,marginBottom:3}}>{d.name}</div>
          <div style={{color:'var(--txt3)',fontSize:12,marginBottom:8}}>{d.speciality}</div>
          <div style={{color:'#F59E0B',fontSize:12,marginBottom:10}}>★ {d.rating} · {d.experience_years} yrs</div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,color:'var(--teal)',marginBottom:14}}>₹{d.consultation_fee}</div>
          <div style={{display:'flex',gap:6}}>
            <button style={{flex:1,padding:'8px',background:tg,color:'#fff',border:'none',borderRadius:8,fontFamily:'DM Sans,sans-serif',fontSize:12,fontWeight:700,cursor:'pointer'}}>Book</button>
            <button style={{padding:'8px 10px',background:'var(--surf2)',color:'var(--txt2)',border:'1px solid var(--bdr)',borderRadius:8,fontFamily:'DM Sans,sans-serif',fontSize:12,cursor:'pointer'}}>View</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsPanel({ user }) {
  return (
    <div className='fu' style={{maxWidth:500}}>
      <div style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:16,padding:28}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,marginBottom:20}}>Account Details</div>
        {[['Full Name',user?.name],['Email',user?.email],['Role',user?.role]].map(([l,v])=>(
          <div key={l} style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--txt2)',marginBottom:5,textTransform:'uppercase',letterSpacing:.4}}>{l}</label>
            <input defaultValue={v} readOnly style={{width:'100%',padding:'11px 14px',background:'var(--surf2)',border:'1.5px solid var(--bdr)',borderRadius:10,fontSize:13,color:'var(--txt)',outline:'none'}}/>
          </div>
        ))}
        <div style={{padding:'12px 14px',background:'var(--tealXL)',borderRadius:10,fontSize:13,color:'var(--tealDk)',display:'flex',alignItems:'center',gap:8}}>
          <i className='fas fa-database'/> Connected to live PostgreSQL database
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [panel, setPanel] = useState('overview');
  const titles = { overview:'Dashboard', appointments:'Appointments', queue:user?.role==='doctor'?'Queue Management':'Queue Status', doctors:'Find Doctors', admin:'Analytics', settings:'Settings', payments:'Payments' };

  const renderPanel = () => {
    switch(panel) {
      case 'overview': return <OverviewPanel role={user?.role}/>;
      case 'appointments': return <AppointmentsPanel role={user?.role}/>;
      case 'queue': return <QueuePanel role={user?.role}/>;
      case 'doctors': return <DoctorsPanel/>;
      case 'admin': return <AdminPanel/>;
      case 'payments': return <PaymentsPanel/>;
      case 'settings': return <SettingsPanel user={user}/>;
      default: return <div style={{padding:40,color:'var(--txt2)'}}>Coming soon...</div>;
    }
  };

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden'}}>
      <ToastStack/>
      <Sidebar role={user?.role} active={panel} onNav={setPanel} user={user} onLogout={logout}/>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{height:62,padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'var(--surf)',borderBottom:'1px solid var(--bdr)',flexShrink:0}}>
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700}}>{titles[panel]||panel}</div>
            <div style={{fontSize:11,color:'var(--txt3)'}}>Welcome back, {user?.name}!</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:12,padding:'4px 12px',borderRadius:99,fontWeight:700,background:'#E6F7F4',color:'#0A7A67',textTransform:'capitalize'}}>{user?.role}</span>
            <div style={{width:36,height:36,borderRadius:9,background:tg,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:13}}>{user?.name?.slice(0,2).toUpperCase()}</div>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:24}} key={panel}>
          {renderPanel()}
        </div>
      </div>
      <Chatbot/>
    </div>
  );
}