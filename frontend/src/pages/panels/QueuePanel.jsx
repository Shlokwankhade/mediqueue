import AIPredictor from '../../components/AIPredictor';

import { useState, useEffect, useCallback, useRef } from 'react';
import { queueAPI, appointmentAPI } from '../../services/api';
import api from '../../services/api';
import { joinQueueRoom, onQueueUpdated, offQueueUpdated, emitCallNext } from '../../services/socket';
import { toast } from '../../components/ToastStack';

const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

export default function QueuePanel({ role }) {
  const [queue, setQueue] = useState([]);
  const [myEntry, setMyEntry] = useState(null);
  const [appts, setAppts] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const intervalRef = useRef(null);

  const loadQueue = useCallback(async (dId) => {
    if (!dId) return;
    try {
      const r = await queueAPI.getStatus(dId);
      setQueue(r.data.queue || []);
      setLastUpdated(new Date());
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        if (role === 'doctor') {
          // Auto-detect doctor ID from logged in user
          const r = await api.get('/auth/me');
          const docId = r.data.user?.doctor_id;
          if (docId) {
            setDoctorId(docId);
          } else {
            toast('Doctor profile not found. Please complete your profile.', 'warning');
            setLoading(false);
          }
        } else if (role === 'patient') {
          const r = await appointmentAPI.getAll();
          const confirmed = (r.data.appointments||[]).filter(a=>a.status==='confirmed');
          setAppts(confirmed);
          setLoading(false);
        }
      } catch(e) {
        console.error(e);
        setLoading(false);
      }
    };
    init();
  }, [role]);

  useEffect(() => {
    if (!doctorId) return;
    joinQueueRoom(doctorId);
    loadQueue(doctorId);
    onQueueUpdated(() => loadQueue(doctorId));
    intervalRef.current = setInterval(() => loadQueue(doctorId), 15000);
    return () => {
      offQueueUpdated();
      if(intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [doctorId, loadQueue]);

  const joinQueue = async (apptId, dId) => {
    setJoining(true);
    try {
      const r = await queueAPI.join(apptId);
      setMyEntry(r.data.queueEntry);
      setDoctorId(dId);
      toast('Joined queue! Token: ' + r.data.queueEntry.token_number, 'success');
      loadQueue(dId);
    } catch(e) { toast(e.response?.data?.message || 'Failed to join queue', 'error'); }
    finally { setJoining(false); }
  };

  const callNext = async () => {
    try {
      const r = await queueAPI.callNext(doctorId);
      if (r.data.next) {
        emitCallNext({ doctorId, tokenNumber: r.data.next.token_number, patientName: r.data.next.patient_name });
        toast('Called: ' + r.data.next.token_number + ' ? ' + r.data.next.patient_name, 'success');
        loadQueue(doctorId);
      } else { toast('No more patients in queue', 'info'); }
    } catch(e) { toast('Failed to call next', 'error'); }
  };

  const current = queue.find(q => q.status === 'in_progress');
  const waiting = queue.filter(q => q.status === 'waiting');
  const done = queue.filter(q => q.status === 'completed');
  const myPosition = myEntry ? waiting.findIndex(q => q.token_number === myEntry.token_number) + 1 : 0;

  const LiveBadge = () => (
    <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:99,background:'#D1FAE5',color:'#065F46',fontSize:11,fontWeight:700}}>
      <span style={{width:6,height:6,borderRadius:'50%',background:'#10B981',display:'inline-block'}}/>
      LIVE - Auto updates
    </div>
  );

  if (loading) return (
    <div style={{padding:60,textAlign:'center',color:'#94A3B8'}}>
      <i className='fas fa-spinner fa-spin' style={{fontSize:32,display:'block',marginBottom:12,color:'#0D9B82'}}/>
      Loading queue...
    </div>
  );

  // PATIENT VIEW
  if (role === 'patient') return (
    <div className='fu'>
      {!myEntry ? (
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700}}>Join Queue</div>
            <LiveBadge/>
          </div>
          <div style={{background:'white',border:'1px solid #E2E8F0',borderRadius:16,padding:24}}>
            {appts.length === 0 ? (
              <div style={{textAlign:'center',padding:'40px 0',color:'#94A3B8'}}>
                <i className='fas fa-ticket-alt' style={{fontSize:40,display:'block',marginBottom:14,color:'#0D9B82'}}/>
                <div style={{fontSize:15,fontWeight:600,marginBottom:6,color:'#0A1628'}}>No confirmed appointments</div>
                <div style={{fontSize:13}}>Book and confirm an appointment first to join the queue</div>
              </div>
            ) : appts.map(a => (
              <div key={a.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:16,background:'#F8FAFC',borderRadius:14,marginBottom:10,border:'1px solid #E2E8F0'}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:44,height:44,borderRadius:12,background:tg,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:14}}>
                    {a.doctor_name?.slice(0,2) || 'Dr'}
                  </div>
                  <div>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:3}}>{a.doctor_name || 'Doctor'}</div>
                    <div style={{fontSize:12,color:'#94A3B8'}}>{new Date(a.appointment_time).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</div>
                  </div>
                </div>
                <button onClick={() => joinQueue(a.id, a.doctor_id)} disabled={joining}
                  style={{padding:'9px 20px',background:tg,color:'#fff',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                  {joining ? 'Joining...' : 'Join Queue'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700}}>Your Queue Status</div>
            <LiveBadge/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div style={{background:'white',border:'1px solid #E2E8F0',borderRadius:20,padding:28,textAlign:'center'}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.8,color:'#94A3B8',marginBottom:8}}>Your Token</div>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:88,fontWeight:900,color:'#0D9B82',lineHeight:1,marginBottom:10}}>
                {myEntry.token_number?.split('-')[1] || myEntry.token_number}
              </div>
              <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'#E6F7F4',color:'#0A7A67',padding:'6px 16px',borderRadius:99,fontSize:12,fontWeight:700,marginBottom:20}}>
                <i className='fas fa-ticket-alt'/> {myEntry.token_number}
              </div>
              <div style={{background:'#FEF3C7',borderRadius:16,padding:16,marginBottom:16}}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:36,fontWeight:800,color:'#D97706',lineHeight:1,marginBottom:4}}>
                  ~{Math.abs(myEntry.estimated_wait_minutes || (myPosition * 8))} min
                </div>
                <div style={{color:'#92400E',fontSize:13,fontWeight:600}}>Estimated wait time</div>
              </div>
              {myPosition > 0 && (
                <div style={{background:'#E6F7F4',borderRadius:12,padding:12,marginBottom:16}}>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:28,fontWeight:800,color:'#0D9B82'}}>#{myPosition}</div>
                  <div style={{color:'#94A3B8',fontSize:12}}>Your position in queue</div>
                </div>
              )}
              {current && (
                <div style={{background:'#DBEAFE',borderRadius:12,padding:'10px 14px',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
                  <i className='fas fa-user-md' style={{color:'#1E40AF',fontSize:14}}/>
                  <div style={{fontSize:13,color:'#1E40AF'}}>Now serving: <strong>{current.token_number}</strong></div>
                </div>
              )}
              <AIPredictor 
                position={myPosition || 1}
                appointmentType="in_person"
                completedToday={done.length}
                show={true}
              />
              <button onClick={() => loadQueue(myEntry.doctor_id)}
                style={{width:'100%',padding:'10px',background:tg,color:'#fff',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
                <i className='fas fa-sync-alt'/> Refresh
              </button>
              <div style={{fontSize:11,color:'#94A3B8',marginTop:8}}>
                Last updated: {lastUpdated.toLocaleTimeString('en-IN',{timeStyle:'short'})}
              </div>
            </div>
            <div style={{background:'white',border:'1px solid #E2E8F0',borderRadius:20,padding:22}}>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:14,fontWeight:700,marginBottom:6}}>Live Queue</div>
              <div style={{fontSize:12,color:'#94A3B8',marginBottom:14}}>{queue.length} total patients</div>
              {queue.map((q, i) => {
                const isMe = q.token_number === myEntry.token_number;
                const isCurrent = q.status === 'in_progress';
                const isDone = q.status === 'completed';
                return (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'11px',borderRadius:12,marginBottom:6,
                    background: isMe?'#E6F7F4':isCurrent?'#DBEAFE':isDone?'#F0FDF4':'#F8FAFC',
                    border: isMe?'2px solid #0D9B82':isCurrent?'1px solid #93C5FD':'1px solid transparent'}}>
                    <div style={{width:36,height:36,borderRadius:9,flexShrink:0,
                      background:isCurrent?tg:isDone?'#D1FAE5':isMe?'#0D9B82':'#E2E8F0',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:11,fontWeight:700,color:isCurrent||isMe?'#fff':isDone?'#065F46':'#94A3B8'}}>
                      {q.token_number?.split('-')[1] || i+1}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:isMe?'#0D9B82':'#0A1628'}}>
                        {isMe ? 'You' : q.patient_name}
                        {isMe && <span style={{marginLeft:6,fontSize:10,background:'#0D9B82',color:'white',padding:'1px 6px',borderRadius:99}}>YOU</span>}
                      </div>
                      <div style={{fontSize:11,color:'#94A3B8'}}>{q.token_number}</div>
                    </div>
                    <span style={{fontSize:10,padding:'3px 8px',borderRadius:99,fontWeight:700,
                      background:isDone?'#D1FAE5':isCurrent?'#DBEAFE':'#FEF3C7',
                      color:isDone?'#065F46':isCurrent?'#1E40AF':'#92400E'}}>
                      {isDone?'Done':isCurrent?'Now':'Waiting'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // DOCTOR VIEW - Auto loaded
  return (
    <div className='fu'>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700}}>Queue Management</div>
        <LiveBadge/>
      </div>

      {!doctorId ? (
        <div style={{background:'white',border:'1px solid #E2E8F0',borderRadius:16,padding:40,textAlign:'center'}}>
          <i className='fas fa-exclamation-circle' style={{fontSize:40,display:'block',marginBottom:14,color:'#F59E0B'}}/>
          <div style={{fontSize:15,fontWeight:600,marginBottom:8}}>Doctor profile not found</div>
          <div style={{fontSize:13,color:'#94A3B8'}}>Please complete your doctor profile in Settings</div>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{background:'white',border:'1px solid #E2E8F0',borderRadius:20,padding:28,textAlign:'center'}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.8,color:'#94A3B8',marginBottom:8}}>Now Serving</div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:80,fontWeight:900,color:'#0D9B82',lineHeight:1,marginBottom:8}}>
              {current ? current.token_number?.split('-')[1] : '--'}
            </div>
            <div style={{fontWeight:600,fontSize:15,marginBottom:4,color:'#0A1628'}}>{current?.patient_name || 'Queue Empty'}</div>
            <div style={{fontSize:12,color:'#94A3B8',marginBottom:24}}>
              Waiting: {waiting.length} | Done: {done.length}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
              <div style={{background:'#E6F7F4',borderRadius:14,padding:14,textAlign:'center'}}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:28,fontWeight:800,color:'#0D9B82'}}>{waiting.length}</div>
                <div style={{fontSize:12,color:'#94A3B8'}}>Waiting</div>
              </div>
              <div style={{background:'#D1FAE5',borderRadius:14,padding:14,textAlign:'center'}}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:28,fontWeight:800,color:'#065F46'}}>{done.length}</div>
                <div style={{fontSize:12,color:'#94A3B8'}}>Completed</div>
              </div>
            </div>
            <button onClick={callNext} disabled={waiting.length===0}
              style={{width:'100%',padding:'13px',background:waiting.length===0?'#F1F5F9':tg,color:waiting.length===0?'#94A3B8':'#fff',border:'none',borderRadius:12,fontFamily:'DM Sans,sans-serif',fontSize:15,fontWeight:700,cursor:waiting.length===0?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:10}}>
              <i className='fas fa-arrow-right'/>
              {waiting.length===0 ? 'No Patients Waiting' : 'Call Next Patient'}
            </button>
            <button onClick={() => loadQueue(doctorId)}
              style={{width:'100%',padding:'10px',background:'#F1F5F9',color:'#0A1628',border:'1px solid #E2E8F0',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
              <i className='fas fa-sync-alt'/> Refresh
            </button>
            <div style={{fontSize:11,color:'#94A3B8',marginTop:8}}>
              Last updated: {lastUpdated.toLocaleTimeString('en-IN',{timeStyle:'short'})}
            </div>
          </div>
          <div style={{background:'white',border:'1px solid #E2E8F0',borderRadius:20,padding:22}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:14,fontWeight:700,marginBottom:14}}>
              Waiting List
              <span style={{marginLeft:8,fontSize:12,padding:'2px 10px',borderRadius:99,background:'#FEF3C7',color:'#92400E',fontWeight:700}}>{waiting.length}</span>
            </div>
            {waiting.length === 0 ? (
              <div style={{textAlign:'center',padding:'32px 0',color:'#94A3B8'}}>
                <i className='fas fa-check-circle' style={{fontSize:36,display:'block',marginBottom:10,color:'#10B981'}}/>
                <div style={{fontSize:13,fontWeight:600}}>All caught up!</div>
                <div style={{fontSize:12}}>No patients waiting</div>
              </div>
            ) : waiting.map((q, i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'12px',background:'#F8FAFC',borderRadius:12,marginBottom:8,border:'1px solid #E2E8F0'}}>
                <div style={{width:38,height:38,borderRadius:10,background:'#E2E8F0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#94A3B8',flexShrink:0}}>
                  {q.token_number?.split('-')[1]}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:'#0A1628'}}>{q.patient_name}</div>
                  <div style={{fontSize:11,color:'#94A3B8'}}>~{q.estimated_wait_minutes || ((i+1)*8)} min wait</div>
                </div>
                <span style={{fontSize:11,padding:'3px 9px',borderRadius:99,fontWeight:700,background:'#FEF3C7',color:'#92400E'}}>#{i+1}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
