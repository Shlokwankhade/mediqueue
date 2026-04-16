import { useState, useEffect } from 'react';
import { appointmentAPI, doctorAPI } from '../../services/api';
import Modal from '../../components/Modal';
import { toast } from '../../components/ToastStack';
const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';
const statusColor = { confirmed:{bg:'#D1FAE5',c:'#065F46'}, completed:{bg:'#E6F7F4',c:'#0A7A67'}, cancelled:{bg:'#FFE4E6',c:'#9F1239'}, pending:{bg:'#FEF3C7',c:'#92400E'}, no_show:{bg:'#FFE4E6',c:'#9F1239'} };

export default function AppointmentsPanel({ role }) {
  const [appts, setAppts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ doctor_id:'', date:'', time:'', type:'in_person', chief_complaint:'' });
  const [slots, setSlots] = useState([]);
  const [booking, setBooking] = useState(false);

  const load = async () => {
    try {
      const r = await appointmentAPI.getAll();
      setAppts(r.data.appointments || []);
      if (role === 'patient') {
        const d = await doctorAPI.getAll();
        setDoctors(d.data.doctors || []);
      }
    } catch(e) { toast('Failed to load appointments','error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const loadSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
    try {
      const r = await doctorAPI.getAvailability(doctorId, date);
      setSlots(r.data.slots || []);
    } catch(e) { setSlots([]); }
  };

  const book = async () => {
    if (!form.doctor_id || !form.date || !form.time) { toast('Please fill all fields','warning'); return; }
    setBooking(true);
    try {
      const dt = form.date + 'T' + form.time + ':00';
      await appointmentAPI.book({ doctor_id: form.doctor_id, appointment_time: dt, type: form.type, chief_complaint: form.chief_complaint });
      toast('Appointment booked successfully!','success');
      setModal(false);
      setForm({ doctor_id:'', date:'', time:'', type:'in_person', chief_complaint:'' });
      load();
    } catch(e) { toast(e.response?.data?.message || 'Booking failed','error'); }
    finally { setBooking(false); }
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentAPI.cancel(id);
      toast('Appointment cancelled','info');
      load();
    } catch(e) { toast('Failed to cancel','error'); }
  };

  if (loading) return <div style={{padding:40,color:'var(--txt2)',fontSize:14}}>Loading appointments...</div>;

  return (
    <div className='fu'>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700}}>
          {role==='doctor'?"Today's Schedule":'My Appointments'}
          <span style={{marginLeft:10,fontSize:12,padding:'3px 10px',borderRadius:99,background:'var(--tealXL)',color:'var(--tealDk)',fontWeight:700}}>{appts.length} total</span>
        </div>
        {role==='patient' && <button onClick={()=>setModal(true)} style={{padding:'9px 18px',background:tg,color:'#fff',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:7}}><i className='fas fa-plus'/>Book Appointment</button>}
      </div>

      <div style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:16,overflow:'hidden'}}>
        {appts.length === 0 ? (
          <div style={{textAlign:'center',padding:'48px 0',color:'var(--txt3)',fontSize:14}}>
            <i className='fas fa-calendar' style={{fontSize:40,display:'block',marginBottom:12}}/> No appointments yet
            {role==='patient'&&<button onClick={()=>setModal(true)} style={{marginTop:14,padding:'9px 18px',background:tg,color:'#fff',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer'}}>Book Your First Appointment</button>}
          </div>
        ) : (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{borderBottom:'1px solid var(--bdr)'}}>
              {['Date & Time', role==='doctor'?'Patient':'Doctor', 'Speciality','Type','Status','Action'].map(h=>(
                <th key={h} style={{fontSize:11,fontWeight:700,letterSpacing:.7,textTransform:'uppercase',color:'var(--txt3)',padding:'12px 14px',textAlign:'left'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {appts.map((a,i)=>(
                <tr key={i} style={{borderBottom:'1px solid var(--bdr)',transition:'.15s'}} onMouseEnter={e=>e.currentTarget.style.background='var(--surf2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'13px 14px',fontSize:13,fontWeight:600}}>{new Date(a.appointment_time).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</td>
                  <td style={{padding:'13px 14px',fontSize:13}}>{role==='doctor'?a.patient_name:a.doctor_name||'—'}</td>
                  <td style={{padding:'13px 14px',fontSize:12,color:'var(--txt2)'}}>{a.speciality||'—'}</td>
                  <td style={{padding:'13px 14px'}}><span style={{fontSize:11,padding:'3px 9px',borderRadius:99,fontWeight:700,background:a.type==='telehealth'?'#EDE9FE':'#DBEAFE',color:a.type==='telehealth'?'#5B21B6':'#1E40AF'}}>{a.type}</span></td>
                  <td style={{padding:'13px 14px'}}><span style={{fontSize:11,padding:'3px 9px',borderRadius:99,fontWeight:700,...(statusColor[a.status]||{bg:'#F1F5F9',c:'#64748B'})}}>{a.status}</span></td>
                  <td style={{padding:'13px 14px'}}>
                    {role==='patient' && a.status==='confirmed' && (
                      <button onClick={()=>cancel(a.id)} style={{padding:'5px 12px',background:'#FFE4E6',color:'#9F1239',border:'none',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer'}}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title='Book New Appointment'>
        <div style={{marginBottom:14}}>
          <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--txt2)',marginBottom:5,textTransform:'uppercase',letterSpacing:.4}}>Select Doctor</label>
          <select value={form.doctor_id} onChange={e=>{setForm(f=>({...f,doctor_id:e.target.value,time:''}));loadSlots(e.target.value,form.date);}} style={{width:'100%',padding:'11px 14px',background:'var(--surf2)',border:'1.5px solid var(--bdr)',borderRadius:10,fontSize:13,color:'var(--txt)',outline:'none'}}>
            <option value=''>-- Choose a doctor --</option>
            {doctors.map(d=><option key={d.id} value={d.id}>{d.name} — {d.speciality} (₹{d.consultation_fee})</option>)}
          </select>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--txt2)',marginBottom:5,textTransform:'uppercase',letterSpacing:.4}}>Date</label>
          <input type='date' value={form.date} min={new Date().toISOString().slice(0,10)} onChange={e=>{setForm(f=>({...f,date:e.target.value,time:''}));loadSlots(form.doctor_id,e.target.value);}} style={{width:'100%',padding:'11px 14px',background:'var(--surf2)',border:'1.5px solid var(--bdr)',borderRadius:10,fontSize:13,color:'var(--txt)',outline:'none'}}/>
        </div>
        {slots.length > 0 && (
          <div style={{marginBottom:14}}>
            <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--txt2)',marginBottom:8,textTransform:'uppercase',letterSpacing:.4}}>Available Slots</label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7}}>
              {slots.filter(s=>s.available).map(s=>(
                <button key={s.time} onClick={()=>setForm(f=>({...f,time:s.time}))} style={{padding:'8px 4px',border:'1.5px solid',borderRadius:9,fontSize:12,fontWeight:600,cursor:'pointer',transition:'all .15s',borderColor:form.time===s.time?'var(--teal)':'var(--bdr)',background:form.time===s.time?'var(--tealXL)':'transparent',color:form.time===s.time?'var(--teal)':'var(--txt2)'}}>{s.time}</button>
              ))}
            </div>
          </div>
        )}
        <div style={{marginBottom:14}}>
          <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--txt2)',marginBottom:5,textTransform:'uppercase',letterSpacing:.4}}>Type</label>
          <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={{width:'100%',padding:'11px 14px',background:'var(--surf2)',border:'1.5px solid var(--bdr)',borderRadius:10,fontSize:13,color:'var(--txt)',outline:'none'}}>
            <option value='in_person'>In-Person</option>
            <option value='telehealth'>Telehealth</option>
          </select>
        </div>
        <div style={{marginBottom:22}}>
          <label style={{display:'block',fontSize:12,fontWeight:700,color:'var(--txt2)',marginBottom:5,textTransform:'uppercase',letterSpacing:.4}}>Chief Complaint</label>
          <textarea value={form.chief_complaint} onChange={e=>setForm(f=>({...f,chief_complaint:e.target.value}))} placeholder='Briefly describe your symptoms or reason for visit...' rows={3} style={{width:'100%',padding:'11px 14px',background:'var(--surf2)',border:'1.5px solid var(--bdr)',borderRadius:10,fontSize:13,color:'var(--txt)',outline:'none',resize:'vertical'}}/>
        </div>
        <button onClick={book} disabled={booking} style={{width:'100%',padding:'13px',background:tg,color:'#fff',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(13,155,130,.3)'}}>
          {booking?'Booking...':'Confirm Appointment'}
        </button>
      </Modal>
    </div>
  );
}