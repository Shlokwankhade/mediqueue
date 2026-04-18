import { useState, useEffect } from 'react';
import { appointmentAPI, doctorAPI } from '../../services/api';
import { toast } from '../../components/ToastStack';
import Modal from '../../components/Modal';

const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';
const statusColor = {
  confirmed:{bg:'#D1FAE5',c:'#065F46'},
  completed:{bg:'#E6F7F4',c:'#0A7A67'},
  cancelled:{bg:'#FFE4E6',c:'#9F1239'},
  pending:{bg:'#FEF3C7',c:'#92400E'},
  no_show:{bg:'#FFE4E6',c:'#9F1239'}
};

export default function AppointmentsPanel({ role }) {
  const [appts, setAppts]  = useState([]);
  const [doctors, setDocs] = useState([]);
  const [loading, setLoad] = useState(true);
  const [modal, setModal]  = useState(false);
  const [booking, setBook] = useState(false);
  const [slots, setSlots]  = useState([]);
  const [form, setForm]    = useState({ doctor_id:'', date:'', time:'', type:'in_person', chief_complaint:'' });

  const load = async () => {
    try {
      const r = await appointmentAPI.getAll();
      setAppts(r.data.appointments || []);
      if (role === 'patient') {
        const d = await doctorAPI.getAll();
        setDocs(d.data.doctors || []);
      }
    } catch(e) { toast('Failed to load','error'); }
    finally { setLoad(false); }
  };

  useEffect(() => { load(); }, []);

  const loadSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
    try {
      const r = await doctorAPI.getAvailability(doctorId, date);
      setSlots(r.data.slots || []);
    } catch(e) { setSlots([]); }
  };

  const openModal = () => {
    setForm({ doctor_id:'', date:'', time:'', type:'in_person', chief_complaint:'' });
    setSlots([]);
    setModal(true);
  };

  const book = async () => {
    if (!form.doctor_id) { toast('Please select a doctor','warning'); return; }
    if (!form.date)      { toast('Please select a date','warning'); return; }
    if (!form.time)      { toast('Please select a time slot','warning'); return; }
    setBook(true);
    try {
      await appointmentAPI.book({
        doctor_id: form.doctor_id,
        appointment_time: form.date + 'T' + form.time + ':00',
        type: form.type,
        chief_complaint: form.chief_complaint
      });
      toast('Appointment booked! Check your email', 'success');
      setModal(false);
      load();
    } catch(e) { toast(e.response?.data?.message || 'Booking failed','error'); }
    finally { setBook(false); }
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentAPI.cancel(id);
      toast('Appointment cancelled','info');
      load();
    } catch(e) { toast('Failed to cancel','error'); }
  };

  if (loading) return (
    <div style={{padding:40,textAlign:'center',color:'var(--text-3)'}}>
      <i className="fas fa-spinner fa-spin" style={{fontSize:32,display:'block',marginBottom:12}}/>
      Loading...
    </div>
  );

  const inputStyle = {
    width:'100%',padding:'12px 16px',
    background:'var(--surface-2)',
    border:'1.5px solid var(--border)',
    borderRadius:12,fontSize:14,
    color:'var(--text)',outline:'none',
    fontFamily:'DM Sans,sans-serif',
    marginBottom:0
  };

  const labelStyle = {
    display:'block',fontSize:13,fontWeight:600,
    color:'var(--text-2)',marginBottom:6,
    letterSpacing:.3,textTransform:'uppercase'
  };

  return (
    <div className="fu">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700}}>
          {role==='doctor' ? "Today's Schedule" : 'My Appointments'}
          <span style={{marginLeft:10,fontSize:12,padding:'3px 10px',borderRadius:999,background:'var(--teal-xlight)',color:'var(--teal-dark)',fontWeight:700}}>{appts.length} total</span>
        </div>
        {role==='patient' && (
          <button onClick={openModal} style={{display:'inline-flex',alignItems:'center',gap:7,padding:'9px 18px',background:tg,color:'#fff',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer'}}>
            <i className="fas fa-plus"/> Book Appointment
          </button>
        )}
      </div>

      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden'}}>
        {appts.length === 0 ? (
          <div style={{textAlign:'center',padding:'56px 0',color:'var(--text-3)'}}>
            <i className="fas fa-calendar" style={{fontSize:44,display:'block',marginBottom:14}}/>
            <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>No appointments yet</div>
            {role==='patient' && (
              <button onClick={openModal} style={{marginTop:10,padding:'9px 20px',background:tg,color:'#fff',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer'}}>Book Your First Appointment</button>
            )}
          </div>
        ) : (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'var(--surface-2)'}}>
                {['Date & Time',role==='doctor'?'Patient':'Doctor','Type','Status','Action'].map(h=>(
                  <th key={h} style={{fontSize:11,fontWeight:700,letterSpacing:.7,textTransform:'uppercase',color:'var(--text-3)',padding:'12px 14px',textAlign:'left'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appts.map((a,i)=>(
                <tr key={i} style={{borderTop:'1px solid var(--border)',transition:'.15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'13px 14px',fontSize:13,fontWeight:600}}>{new Date(a.appointment_time).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</td>
                  <td style={{padding:'13px 14px',fontSize:13}}>{role==='doctor'?a.patient_name:(a.doctor_name||'')}</td>
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

      <Modal open={modal} onClose={()=>setModal(false)} title="Book New Appointment" width={480}>
        <div style={{marginBottom:18}}>
          <label style={labelStyle}>
            Select Doctor
            <span style={{marginLeft:8,fontSize:11,padding:'2px 8px',borderRadius:99,background:'var(--teal-xlight)',color:'var(--teal-dark)',fontWeight:700,textTransform:'none'}}>{doctors.length} available</span>
          </label>
          <select
            value={form.doctor_id}
            onChange={e=>{const id=e.target.value;setForm(f=>({...f,doctor_id:id,time:''}));loadSlots(id,form.date);}}
            style={inputStyle}
          >
            <option value="">-- Choose a doctor --</option>
            {doctors.map(d=><option key={d.id} value={d.id}>{d.name}  {d.speciality} ({d.consultation_fee})</option>)}
          </select>
        </div>

        <div style={{marginBottom:18}}>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            value={form.date}
            min={new Date().toISOString().slice(0,10)}
            onChange={e=>{const date=e.target.value;setForm(f=>({...f,date,time:''}));loadSlots(form.doctor_id,date);}}
            style={inputStyle}
          />
        </div>

        {slots.filter(s=>s.available).length > 0 && (
          <div style={{marginBottom:18}}>
            <label style={labelStyle}>Available Time Slots</label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
              {slots.filter(s=>s.available).slice(0,16).map(s=>(
                <button key={s.time} onClick={()=>setForm(f=>({...f,time:s.time}))}
                  style={{padding:'9px 4px',border:'1.5px solid',borderRadius:9,fontSize:12,fontWeight:600,cursor:'pointer',transition:'all .15s',
                    borderColor:form.time===s.time?'#0D9B82':'var(--border)',
                    background:form.time===s.time?'var(--teal-xlight)':'transparent',
                    color:form.time===s.time?'#0D9B82':'var(--text-2)'}}>
                  {s.time}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{marginBottom:18}}>
          <label style={labelStyle}>Appointment Type</label>
          <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={inputStyle}>
            <option value="in_person">In-Person</option>
            <option value="telehealth">Telehealth (Video Call)</option>
          </select>
        </div>

        <div style={{marginBottom:24}}>
          <label style={labelStyle}>Chief Complaint</label>
          <textarea
            value={form.chief_complaint}
            onChange={e=>setForm(f=>({...f,chief_complaint:e.target.value}))}
            placeholder="Briefly describe your symptoms or reason for visit..."
            rows={3}
            style={{...inputStyle,resize:'vertical'}}
          />
        </div>

        <button onClick={book} disabled={booking}
          style={{width:'100%',padding:'13px',background:tg,color:'#fff',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(13,155,130,.3)'}}>
          {booking ? 'Booking...' : 'Confirm Appointment'}
        </button>
      </Modal>
    </div>
  );
}