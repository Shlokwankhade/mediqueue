
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from '../../components/ToastStack';
import Modal from '../../components/Modal';

const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

export default function PrescriptionsPanel({ role }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ appointment_id:'', patient_id:'', notes:'', medicines:[{ name:'', dosage:'', frequency:'', duration:'' }] });

  const load = async () => {
    try {
      const r = await api.get('/prescriptions');
      setPrescriptions(r.data.prescriptions || []);
      if (role === 'doctor') {
        const a = await api.get('/appointments');
        setAppointments((a.data.appointments || []).filter(x => x.status === 'confirmed'));
      }
    } catch(e) { toast('Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addMedicine = () => setForm(f => ({ ...f, medicines: [...f.medicines, { name:'', dosage:'', frequency:'', duration:'' }] }));
  const removeMedicine = (i) => setForm(f => ({ ...f, medicines: f.medicines.filter((_,idx) => idx !== i) }));
  const updateMedicine = (i, field, val) => setForm(f => {
    const meds = [...f.medicines];
    meds[i] = { ...meds[i], [field]: val };
    return { ...f, medicines: meds };
  });

  const submit = async () => {
    if (!form.appointment_id) { toast('Select an appointment', 'warning'); return; }
    if (!form.medicines[0].name) { toast('Add at least one medicine', 'warning'); return; }
    setSubmitting(true);
    try {
      await api.post('/prescriptions', form);
      toast('Prescription sent! Patient will receive email ??', 'success');
      setModal(false);
      setForm({ appointment_id:'', patient_id:'', notes:'', medicines:[{ name:'', dosage:'', frequency:'', duration:'' }] });
      load();
    } catch(e) { toast(e.response?.data?.message || 'Failed', 'error'); }
    finally { setSubmitting(false); }
  };

  const iStyle = { width:'100%', padding:'9px 12px', background:'var(--surface-2)', border:'1.5px solid var(--border)', borderRadius:10, fontSize:13, color:'var(--text)', outline:'none', fontFamily:'DM Sans,sans-serif' };
  const lStyle = { display:'block', fontSize:11, fontWeight:700, color:'var(--text-2)', marginBottom:4, letterSpacing:.3, textTransform:'uppercase' };

  if (loading) return <div style={{padding:40,textAlign:'center',color:'var(--text-3)'}}><i className='fas fa-spinner fa-spin' style={{fontSize:32,display:'block',marginBottom:12}}/>Loading...</div>;

  return (
    <div className='fu'>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700}}>
          {role === 'patient' ? 'My Prescriptions' : 'E-Prescriptions'}
          <span style={{marginLeft:10,fontSize:12,padding:'3px 10px',borderRadius:999,background:'var(--teal-xlight)',color:'var(--teal-dark)',fontWeight:700}}>{prescriptions.length} total</span>
        </div>
        {role === 'doctor' && (
          <button onClick={() => setModal(true)} style={{display:'inline-flex',alignItems:'center',gap:7,padding:'9px 18px',background:tg,color:'#fff',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer'}}>
            <i className='fas fa-plus'/> New Prescription
          </button>
        )}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {prescriptions.length === 0 ? (
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,textAlign:'center',padding:'56px 0',color:'var(--text-3)'}}>
            <i className='fas fa-prescription-bottle-medical' style={{fontSize:44,display:'block',marginBottom:14}}/>
            <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>No prescriptions yet</div>
          </div>
        ) : prescriptions.map((p, i) => (
          <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,marginBottom:3}}>
                  {role === 'patient' ? 'Dr. ' + p.doctor_name : p.patient_name}
                </div>
                <div style={{fontSize:12,color:'var(--text-3)'}}>{new Date(p.created_at).toLocaleDateString('en-IN',{dateStyle:'medium'})}</div>
              </div>
              <span style={{fontSize:11,padding:'4px 12px',borderRadius:99,fontWeight:700,background:'#D1FAE5',color:'#065F46'}}>{p.status}</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:p.notes?12:0}}>
              {(typeof p.medicines === 'string' ? JSON.parse(p.medicines) : p.medicines).map((m, j) => (
                <div key={j} style={{background:'var(--surface-2)',borderRadius:10,padding:12}}>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:4,color:'var(--teal)'}}>{m.name}</div>
                  <div style={{fontSize:11,color:'var(--text-3)'}}>{m.dosage}</div>
                  <div style={{fontSize:11,color:'var(--text-3)'}}>{m.frequency}</div>
                  <div style={{fontSize:11,color:'var(--text-3)',fontWeight:600}}>{m.duration}</div>
                </div>
              ))}
            </div>
            {p.notes && <div style={{background:'#E6F7F4',borderRadius:8,padding:12,fontSize:13,color:'#0A7A67'}}><strong>Notes:</strong> {p.notes}</div>}
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title='New E-Prescription' width={560}>
        <div style={{marginBottom:12}}>
          <label style={lStyle}>Select Appointment</label>
          <select value={form.appointment_id} onChange={e => {
            const appt = appointments.find(a => a.id === e.target.value);
            setForm(f => ({ ...f, appointment_id: e.target.value, patient_id: appt?.patient_id || '' }));
          }} style={iStyle}>
            <option value=''>-- Select appointment --</option>
            {appointments.map(a => (
              <option key={a.id} value={a.id}>{a.patient_name} � {new Date(a.appointment_time).toLocaleDateString('en-IN')}</option>
            ))}
          </select>
        </div>

        <div style={{marginBottom:12}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
            <label style={lStyle}>Medicines</label>
            <button onClick={addMedicine} style={{fontSize:11,padding:'4px 10px',background:'var(--teal-xlight)',color:'var(--teal)',border:'none',borderRadius:7,cursor:'pointer',fontWeight:600}}>+ Add</button>
          </div>
          {form.medicines.map((m, i) => (
            <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr auto',gap:6,marginBottom:8}}>
              <input placeholder='Medicine name' value={m.name} onChange={e => updateMedicine(i,'name',e.target.value)} style={iStyle}/>
              <input placeholder='Dosage' value={m.dosage} onChange={e => updateMedicine(i,'dosage',e.target.value)} style={iStyle}/>
              <input placeholder='Frequency' value={m.frequency} onChange={e => updateMedicine(i,'frequency',e.target.value)} style={iStyle}/>
              <input placeholder='Duration' value={m.duration} onChange={e => updateMedicine(i,'duration',e.target.value)} style={iStyle}/>
              {form.medicines.length > 1 && <button onClick={() => removeMedicine(i)} style={{background:'#FFE4E6',color:'#9F1239',border:'none',borderRadius:8,width:32,cursor:'pointer',fontSize:14}}>x</button>}
            </div>
          ))}
        </div>

        <div style={{marginBottom:16}}>
          <label style={lStyle}>Doctor Notes</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes:e.target.value}))} placeholder='Additional instructions for patient...' rows={2} style={{...iStyle, resize:'vertical'}}/>
        </div>

        <button onClick={submit} disabled={submitting} style={{width:'100%',padding:'12px',background:tg,color:'#fff',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(13,155,130,.3)'}}>
          {submitting ? 'Sending...' : 'Send Prescription via Email ??'}
        </button>
      </Modal>
    </div>
  );
}
