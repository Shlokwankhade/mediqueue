import { useState, useEffect } from 'react';

import VideoCall from '../../components/VideoCall';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from '../../components/ToastStack';

const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

export default function VideoPanel({ role }) {
  const { user } = useAuth();
  const [inCall, setInCall] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [joinRoom, setJoinRoom] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments').then(r => {
      const appts = (r.data.appointments || []).filter(a =>
        a.type === 'telehealth' && a.status === 'confirmed'
      );
      setAppointments(appts);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const startCall = (apptId) => {
    const room = 'mq-' + apptId;
    setRoomId(room);
    setInCall(true);
  };

  const joinCall = () => {
    if (!joinRoom.trim()) { toast('Enter a room ID', 'warning'); return; }
    setRoomId(joinRoom.trim());
    setInCall(true);
  };

  if (inCall) return (
    <VideoCall
      roomId={roomId}
      userName={user?.name}
      isDoctor={role === 'doctor'}
      onClose={() => { setInCall(false); setRoomId(''); }}
    />
  );

  return (
    <div className='fu'>
      <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700,marginBottom:24,color:'var(--txt)'}}>
        Video Telemedicine
      </div>

      {/* Start new call */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
        <div style={{background:'var(--surface,white)',border:'1px solid var(--border,#E2E8F0)',borderRadius:20,padding:24}}>
          <div style={{width:52,height:52,borderRadius:16,background:'linear-gradient(135deg,#0D9B82,#1DBEA0)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
            <i className='fas fa-video' style={{color:'white',fontSize:22}}/>
          </div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,marginBottom:8,color:'var(--txt)'}}>
            {role === 'doctor' ? 'Start Consultation' : 'Join Consultation'}
          </div>
          <div style={{fontSize:13,color:'var(--txt2,#64748B)',marginBottom:16,lineHeight:1.6}}>
            {role === 'doctor'
              ? 'Start a video call for a telehealth appointment. Share the room ID with your patient.'
              : 'Join a video call with your doctor. Enter the room ID provided by your doctor.'
            }
          </div>
          <div style={{display:'flex',gap:8}}>
            <input
              value={joinRoom}
              onChange={e=>setJoinRoom(e.target.value)}
              placeholder='Enter Room ID (e.g. mq-abc123)'
              style={{flex:1,padding:'10px 14px',background:'var(--surface-2,#F8FAFC)',border:'1.5px solid var(--border,#E2E8F0)',borderRadius:10,fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif',color:'var(--txt)'}}
              onKeyPress={e=>e.key==='Enter'&&joinCall()}
            />
            <button onClick={joinCall} style={{padding:'10px 16px',background:tg,color:'white',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}>
              {role === 'doctor' ? 'Start' : 'Join'}
            </button>
          </div>
        </div>

        <div style={{background:'linear-gradient(135deg,#0A1628,#0D1F35)',border:'1px solid rgba(13,155,130,0.2)',borderRadius:20,padding:24,color:'white'}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,marginBottom:16}}>How it works</div>
          {[
            {icon:'fa-calendar-check',text:'Book a Telehealth appointment'},
            {icon:'fa-video',text:role==='doctor'?'Doctor starts the call':'Doctor sends Room ID'},
            {icon:'fa-users',text:'Both join the video call'},
            {icon:'fa-prescription-bottle',text:'Doctor issues e-prescription'},
          ].map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
              <div style={{width:32,height:32,borderRadius:9,background:'rgba(13,155,130,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <i className={'fas '+s.icon} style={{color:'#0D9B82',fontSize:13}}/>
              </div>
              <div style={{fontSize:13,color:'#94A3B8'}}>{s.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Telehealth appointments */}
      <div style={{background:'var(--surface,white)',border:'1px solid var(--border,#E2E8F0)',borderRadius:20,padding:24}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,marginBottom:16,color:'var(--txt)'}}>
          Telehealth Appointments
        </div>
        {loading ? (
          <div style={{textAlign:'center',padding:'30px',color:'#94A3B8'}}>
            <i className='fas fa-spinner fa-spin' style={{fontSize:24,display:'block',marginBottom:8,color:'#0D9B82'}}/>
            Loading...
          </div>
        ) : appointments.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px',color:'#94A3B8'}}>
            <i className='fas fa-video' style={{fontSize:36,display:'block',marginBottom:12,color:'#0D9B82'}}/>
            <div style={{fontSize:14,fontWeight:600,marginBottom:6,color:'var(--txt)'}}>No telehealth appointments</div>
            <div style={{fontSize:13}}>Book a telehealth appointment to start video consultations</div>
          </div>
        ) : appointments.map((a,i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:16,background:'var(--surface-2,#F8FAFC)',borderRadius:14,marginBottom:10,border:'1px solid var(--border,#E2E8F0)'}}>
            <div style={{width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,#0EA5E9,#38BDF8)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:16,flexShrink:0}}>
              <i className='fas fa-video'/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:14,color:'var(--txt)',marginBottom:3}}>
                {role === 'doctor' ? a.patient_name : a.doctor_name}
              </div>
              <div style={{fontSize:12,color:'#94A3B8'}}>
                {new Date(a.appointment_time).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}
              </div>
            </div>
            <button onClick={()=>startCall(a.id)} style={{
              padding:'9px 18px',
              background:'linear-gradient(135deg,#0EA5E9,#38BDF8)',
              color:'white',border:'none',borderRadius:10,
              fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,
              cursor:'pointer',display:'flex',alignItems:'center',gap:7,
              boxShadow:'0 4px 12px rgba(14,165,233,0.3)'
            }}>
              <i className='fas fa-video'/> Start Call
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
