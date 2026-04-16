import { useState, useEffect, useCallback } from 'react';
import { queueAPI, appointmentAPI } from '../../services/api';
import { joinQueueRoom, onQueueUpdated, offQueueUpdated, emitCallNext } from '../../services/socket';
import { toast } from '../../components/ToastStack';
const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

export default function QueuePanel({ role }) {
  const [queue, setQueue] = useState([]);
  const [myEntry, setMyEntry] = useState(null);
  const [appts, setAppts] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);

  const loadQueue = useCallback(async (dId) => {
    if (!dId) return;
    setLoading(true);
    try {
      const r = await queueAPI.getStatus(dId);
      setQueue(r.data.queue || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (role === 'patient') {
      appointmentAPI.getAll().then(r => {
        const confirmed = (r.data.appointments||[]).filter(a=>a.status==='confirmed');
        setAppts(confirmed);
      });
    }
  }, [role]);

  useEffect(() => {
    if (!doctorId) return;
    joinQueueRoom(doctorId);
    loadQueue(doctorId);
    onQueueUpdated((data) => {
      toast('Queue updated: Token ' + data.currentToken + ' called','info');
      loadQueue(doctorId);
    });
    return () => offQueueUpdated();
  }, [doctorId, loadQueue]);

  const joinQueue = async (apptId, dId) => {
    setJoining(true);
    try {
      const r = await queueAPI.join(apptId);
      setMyEntry(r.data.queueEntry);
      setDoctorId(dId);
      toast('Joined queue! Token: ' + r.data.queueEntry.token_number,'success');
      loadQueue(dId);
    } catch(e) { toast(e.response?.data?.message||'Failed to join queue','error'); }
    finally { setJoining(false); }
  };

  const callNext = async () => {
    try {
      const r = await queueAPI.callNext(doctorId);
      if (r.data.next) {
        emitCallNext({ doctorId, tokenNumber: r.data.next.token_number, patientName: r.data.next.patient_name });
        toast('Called: ' + r.data.next.token_number,'success');
        loadQueue(doctorId);
      } else { toast('No more patients in queue','info'); }
    } catch(e) { toast('Failed to call next','error'); }
  };

  const current = queue.find(q=>q.status==='in_progress');
  const waiting = queue.filter(q=>q.status==='waiting');
  const done = queue.filter(q=>q.status==='completed');

  if (role === 'patient') return (
    <div className='fu'>
      {!myEntry ? (
        <div style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:16,padding:28}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,marginBottom:16}}>Join Queue</div>
          {appts.length === 0 ? (
            <div style={{textAlign:'center',padding:'32px 0',color:'var(--txt3)',fontSize:14}}>
              <i className='fas fa-ticket-alt' style={{fontSize:36,display:'block',marginBottom:12}}/>
              No confirmed appointments to join queue for.
            </div>
          ) : appts.map(a=>(
            <div key={a.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px',background:'var(--surf2)',borderRadius:12,marginBottom:10}}>
              <div>
                <div style={{fontWeight:600,fontSize:14,marginBottom:3}}>{a.doctor_name||'Doctor'}</div>
                <div style={{fontSize:12,color:'var(--txt3)'}}>{new Date(a.appointment_time).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</div>
              </div>
              <button onClick={()=>joinQueue(a.id, a.doctor_id)} disabled={joining} style={{padding:'8px 16px',background:tg,color:'#fff',border:'none',borderRadius:9,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                {joining?'Joining...':'Join Queue'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:16,padding:28,textAlign:'center'}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.8,color:'var(--txt3)',marginBottom:4}}>Your Token</div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:80,fontWeight:800,color:'var(--teal)',lineHeight:1,marginBottom:8}}>{myEntry.token_number?.split('-')[1]}</div>
            <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'var(--tealXL)',color:'var(--tealDk)',padding:'5px 14px',borderRadius:99,fontSize:12,fontWeight:700,marginBottom:20}}><i className='fas fa-ticket-alt'/>{myEntry.token_number}</div>
            <div style={{width:'100%',height:7,background:'var(--surf2)',borderRadius:99,overflow:'hidden',marginBottom:14}}>
              <div style={{height:'100%',background:tg,borderRadius:99,width: done.length+waiting.length>0 ? (done.length/(done.length+waiting.length+1)*100)+'%' : '0%',transition:'width 1s ease'}}/>
            </div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:32,fontWeight:800,color:'#F59E0B',marginBottom:4}}>~{myEntry.estimated_wait_minutes} min</div>
            <div style={{color:'var(--txt3)',fontSize:13,marginBottom:20}}>Estimated wait time</div>
            <div style={{display:'flex',gap:8,justifyContent:'center'}}>
              <button onClick={()=>loadQueue(myEntry.doctor_id)} style={{padding:'9px 16px',background:tg,color:'#fff',border:'none',borderRadius:9,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer'}}><i className='fas fa-sync-alt' style={{marginRight:6}}/>Refresh</button>
            </div>
          </div>
          <div style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:16,padding:22}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:14,fontWeight:700,marginBottom:14}}>Live Queue</div>
            {loading ? <div style={{color:'var(--txt3)',fontSize:13}}>Loading...</div> : queue.map((q,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px',borderRadius:10,marginBottom:6,background:q.token_number===myEntry.token_number?'var(--tealXL)':q.status==='in_progress'?'#DBEAFE':'var(--surf2)',border:q.token_number===myEntry.token_number?'1.5px solid var(--teal)':'1px solid transparent'}}>
                <div style={{width:36,height:36,borderRadius:9,background:q.status==='in_progress'?tg:'var(--bdr)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:q.status==='in_progress'?'#fff':'var(--txt3)',flexShrink:0}}>{q.token_number?.split('-')[1]}</div>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{q.patient_name}</div><div style={{fontSize:11,color:'var(--txt3)'}}>{q.token_number}</div></div>
                <span style={{fontSize:10,padding:'2px 8px',borderRadius:99,fontWeight:700,background:q.status==='completed'?'#D1FAE5':q.status==='in_progress'?'#DBEAFE':'#FEF3C7',color:q.status==='completed'?'#065F46':q.status==='in_progress'?'#1E40AF':'#92400E'}}>{q.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className='fu'>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:16,padding:28,textAlign:'center'}}>
          <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.8,color:'var(--txt3)',marginBottom:4}}>Now Serving</div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:72,fontWeight:800,color:'var(--teal)',lineHeight:1,marginBottom:8}}>{current?current.token_number?.split('-')[1]:'—'}</div>
          <div style={{fontWeight:600,marginBottom:4}}>{current?.patient_name||'Queue Empty'}</div>
          <div style={{color:'var(--txt3)',fontSize:12,marginBottom:22}}>Waiting: {waiting.length} · Done: {done.length}</div>
          <div style={{display:'flex',gap:10,justifyContent:'center'}}>
            <button onClick={callNext} style={{padding:'11px 22px',background:tg,color:'#fff',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:7}}><i className='fas fa-arrow-right'/>Call Next</button>
            <button onClick={()=>loadQueue(doctorId)} style={{padding:'11px 16px',background:'var(--surf2)',color:'var(--txt)',border:'1px solid var(--bdr)',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:600,cursor:'pointer'}}><i className='fas fa-sync-alt'/></button>
          </div>
        </div>
        <div style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:16,padding:22}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:14,fontWeight:700,marginBottom:14}}>Waiting List ({waiting.length})</div>
          {waiting.length===0?<div style={{textAlign:'center',padding:'24px 0',color:'var(--txt3)',fontSize:13}}>No patients waiting</div>:waiting.map((q,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'11px',background:'var(--surf2)',borderRadius:10,marginBottom:8}}>
              <div style={{width:34,height:34,borderRadius:9,background:'var(--bdr)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'var(--txt3)',flexShrink:0}}>{q.token_number?.split('-')[1]}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{q.patient_name}</div><div style={{fontSize:11,color:'var(--txt3)'}}>~{q.estimated_wait_minutes} min wait</div></div>
              <span style={{fontSize:10,padding:'2px 8px',borderRadius:99,fontWeight:700,background:'#FEF3C7',color:'#92400E'}}>#{q.position}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}