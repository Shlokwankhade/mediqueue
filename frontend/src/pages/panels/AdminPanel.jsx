import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from '../../components/ToastStack';
const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getStats(), adminAPI.getUsers()])
      .then(([s, u]) => { setStats(s.data.stats); setUsers(u.data.users||[]); })
      .catch(() => toast('Failed to load admin data','error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{padding:40,color:'var(--txt2)',fontSize:14}}>Loading admin data...</div>;

  const mc = (label, val, icon, bg, color) => (
    <div style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:14,padding:'18px 20px',position:'relative',overflow:'hidden'}}>
      <div style={{fontSize:11,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.6,marginBottom:7}}>{label}</div>
      <div style={{fontFamily:'Syne,sans-serif',fontSize:28,fontWeight:700}}>{val}</div>
      <div style={{position:'absolute',top:14,right:14,width:38,height:38,borderRadius:10,background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color}}><i className={'fas fa-'+icon}/></div>
    </div>
  );

  return (
    <div className='fu'>
      {stats && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
          {mc('Total Patients', stats.totalPatients, 'users', '#E6F7F4', '#0D9B82')}
          {mc('Active Doctors', stats.activeDoctors, 'user-md', '#EDE9FE', '#7C3AED')}
          {mc("Today's Appts", stats.todayAppointments, 'calendar-check', '#FEF3C7', '#F59E0B')}
          {mc('Queue Size', stats.currentQueueSize, 'ticket-alt', '#FFE4E6', '#F43F5E')}
        </div>
      )}
      <div style={{display:'flex',gap:4,background:'var(--surf2)',borderRadius:10,padding:4,marginBottom:18,width:'fit-content'}}>
        {['stats','users'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'8px 18px',border:'none',borderRadius:8,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:600,cursor:'pointer',background:tab===t?'var(--surf)':'transparent',color:tab===t?'var(--teal)':'var(--txt2)',transition:'all .2s',textTransform:'capitalize'}}>{t==='stats'?'System Stats':'All Users'}</button>
        ))}
      </div>
      {tab==='stats' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:16,padding:22}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:14,fontWeight:700,marginBottom:16}}>System Status</div>
            {[['API Server','Operational','#D1FAE5','#065F46'],['PostgreSQL DB','Connected','#D1FAE5','#065F46'],['WebSocket','Active','#D1FAE5','#065F46'],['Queue Engine','Running','#D1FAE5','#065F46']].map(([s,v,bg,c])=>(
              <div key={s} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--bdr)',fontSize:13}}>
                <span>{s}</span>
                <span style={{fontSize:11,padding:'3px 10px',borderRadius:99,fontWeight:700,background:bg,color:c}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:16,padding:22}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:14,fontWeight:700,marginBottom:16}}>User Breakdown</div>
            {[['Patients',users.filter(u=>u.role==='patient').length,'#E6F7F4','#0D9B82'],['Doctors',users.filter(u=>u.role==='doctor').length,'#EDE9FE','#7C3AED'],['Admins',users.filter(u=>u.role==='admin').length,'#FEF3C7','#F59E0B']].map(([l,v,bg,c])=>(
              <div key={l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--bdr)',fontSize:13}}>
                <span>{l}</span>
                <span style={{fontSize:13,fontWeight:700,padding:'3px 12px',borderRadius:99,background:bg,color:c}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==='users' && (
        <div style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:16,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{borderBottom:'1px solid var(--bdr)'}}>
              {['Name','Email','Phone','Role','Status','Joined'].map(h=>(
                <th key={h} style={{fontSize:11,fontWeight:700,letterSpacing:.7,textTransform:'uppercase',color:'var(--txt3)',padding:'12px 14px',textAlign:'left'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {users.map((u,i)=>(
                <tr key={i} style={{borderBottom:'1px solid var(--bdr)'}} onMouseEnter={e=>e.currentTarget.style.background='var(--surf2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'12px 14px',fontSize:13,fontWeight:600}}>{u.name}</td>
                  <td style={{padding:'12px 14px',fontSize:13,color:'var(--txt2)'}}>{u.email}</td>
                  <td style={{padding:'12px 14px',fontSize:13,color:'var(--txt2)'}}>{u.phone||'—'}</td>
                  <td style={{padding:'12px 14px'}}><span style={{fontSize:11,padding:'3px 9px',borderRadius:99,fontWeight:700,background:u.role==='admin'?'#FEF3C7':u.role==='doctor'?'#EDE9FE':'#E6F7F4',color:u.role==='admin'?'#92400E':u.role==='doctor'?'#5B21B6':'#065F46',textTransform:'capitalize'}}>{u.role}</span></td>
                  <td style={{padding:'12px 14px'}}><span style={{fontSize:11,padding:'3px 9px',borderRadius:99,fontWeight:700,background:u.is_active?'#D1FAE5':'#FFE4E6',color:u.is_active?'#065F46':'#9F1239'}}>{u.is_active?'Active':'Inactive'}</span></td>
                  <td style={{padding:'12px 14px',fontSize:12,color:'var(--txt3)'}}>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}