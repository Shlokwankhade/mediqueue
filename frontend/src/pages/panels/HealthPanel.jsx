
import { useState, useEffect, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import api from '../../services/api';
import { toast } from '../../components/ToastStack';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';
const iStyle = { width:'100%', padding:'10px 14px', background:'var(--surface-2)', border:'1.5px solid var(--border)', borderRadius:10, fontSize:14, color:'var(--text)', outline:'none', fontFamily:'DM Sans,sans-serif' };
const lStyle = { display:'block', fontSize:11, fontWeight:700, color:'var(--text-2)', marginBottom:5, textTransform:'uppercase', letterSpacing:.4 };

export default function HealthPanel() {
  const { user } = useAuth();
  const [record, setRecord] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const printRef = useRef(null);

  const [form, setForm] = useState({
    blood_group:'', height_cm:'', weight_kg:'',
    allergies:'', chronic_conditions:'', current_medications:'',
    emergency_contact_name:'', emergency_contact_phone:'',
    emergency_contact_relation:'', insurance_provider:'',
    insurance_number:'', notes:''
  });

  useEffect(() => {
    if (user?.role === 'doctor') {
      loadDoctorPatients();
    } else {
      loadData();
    }
  }, [user]);

  const loadDoctorPatients = async () => {
    try {
      const r = await api.get('/messages/contacts');
      const pts = (r.data.contacts || []).filter(c => c.role === 'patient');
      setPatients(pts);
      if (pts.length > 0) loadPatientRecord(pts[0].id);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadPatientRecord = async (patientId) => {
    setLoading(true);
    try {
      const r = await api.get('/health/patient/' + patientId);
      setSelectedPatient(r.data.patient);
      if (r.data.record) setForm(f => ({ ...f, ...r.data.record }));
      setVitals(r.data.vitals || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadData = async () => {
    try {
      const [r1, r2] = await Promise.all([
        api.get('/health/record'),
        api.get('/health/vitals')
      ]);
      if (r1.data.record) {
        setRecord(r1.data.record);
        setForm(f => ({ ...f, ...r1.data.record }));
      }
      setVitals(r2.data.vitals || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/health/record', form);
      toast('Health record saved!', 'success');
      loadData();
    } catch(e) { toast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const shareRecord = async () => {
    setSharing(true);
    try {
      const r = await api.post('/health/share');
      setShareUrl(r.data.shareUrl);
      await navigator.clipboard.writeText(r.data.shareUrl);
      toast('Share link copied to clipboard! Valid for 24 hours.', 'success');
    } catch(e) { toast('Failed to generate share link', 'error'); }
    finally { setSharing(false); }
  };

  const downloadPDF = async () => {
    try {
      toast('Generating PDF...', 'info');
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Header
      doc.setFillColor(13, 155, 130);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('MEDIQUEUE', 20, 18);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Health Record Report', 20, 28);
      doc.text('Generated: ' + new Date().toLocaleDateString('en-IN'), 20, 36);

      // Patient Info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Information', 20, 55);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Name: ' + (user?.name || 'N/A'), 20, 65);
      doc.text('Email: ' + (user?.email || 'N/A'), 20, 72);
      doc.text('Blood Group: ' + (form.blood_group || 'N/A'), 20, 79);
      doc.text('Height: ' + (form.height_cm ? form.height_cm + ' cm' : 'N/A'), 120, 65);
      doc.text('Weight: ' + (form.weight_kg ? form.weight_kg + ' kg' : 'N/A'), 120, 72);

      if (form.height_cm && form.weight_kg) {
        const bmi = (form.weight_kg / Math.pow(form.height_cm/100, 2)).toFixed(1);
        doc.text('BMI: ' + bmi, 120, 79);
      }

      // Medical Info
      let y = 95;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Medical History', 20, y);
      y += 10;

      [
        ['Allergies', form.allergies],
        ['Chronic Conditions', form.chronic_conditions],
        ['Current Medications', form.current_medications],
        ['Notes', form.notes],
      ].forEach(([label, val]) => {
        if (val) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(label + ':', 20, y);
          doc.setFont('helvetica', 'normal');
          const lines = doc.splitTextToSize(val, 170);
          doc.text(lines, 20, y + 6);
          y += 6 + (lines.length * 6) + 4;
        }
      });

      // Emergency Contact
      if (form.emergency_contact_name) {
        y += 5;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Emergency Contact', 20, y);
        y += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('Name: ' + form.emergency_contact_name, 20, y);
        doc.text('Phone: ' + (form.emergency_contact_phone || 'N/A'), 20, y + 6);
        doc.text('Relation: ' + (form.emergency_contact_relation || 'N/A'), 20, y + 12);
        y += 20;
      }

      // Recent Vitals
      if (vitals.length > 0) {
        y += 5;
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Recent Vitals', 20, y);
        y += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        vitals.slice(0,5).forEach(v => {
          doc.text(
            new Date(v.recorded_at).toLocaleDateString('en-IN') +
            ' | BP: ' + (v.blood_pressure || 'N/A') +
            ' | Pulse: ' + (v.pulse_rate || 'N/A') +
            ' | SpO2: ' + (v.oxygen_saturation || 'N/A') + '%',
            20, y
          );
          y += 7;
        });
      }

      // Footer
      doc.setFillColor(13, 155, 130);
      doc.rect(0, 280, 210, 17, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('MEDIQUEUE - Digital Appointment and Queue System | Confidential Medical Record', 20, 290);

      doc.save('health-record-' + (user?.name || 'patient').replace(' ','-') + '.pdf');
      toast('PDF downloaded!', 'success');
    } catch(e) {
      console.error(e);
      toast('Failed to generate PDF', 'error');
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const getBMI = () => {
    if (!form.height_cm || !form.weight_kg) return null;
    return (form.weight_kg / Math.pow(form.height_cm/100, 2)).toFixed(1);
  };

  const getBMIStatus = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label:'Underweight', color:'#0EA5E9' };
    if (bmi < 25) return { label:'Normal', color:'#10B981' };
    if (bmi < 30) return { label:'Overweight', color:'#F59E0B' };
    return { label:'Obese', color:'#F43F5E' };
  };

  const bmi = getBMI();
  const bmiStatus = getBMIStatus(bmi);
  const bloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

  // Chart data
  const chartLabels = vitals.slice().reverse().map(v => new Date(v.recorded_at).toLocaleDateString('en-IN',{month:'short',day:'numeric'}));

  const pulseData = {
    labels: chartLabels,
    datasets: [{
      label: 'Pulse Rate (bpm)',
      data: vitals.slice().reverse().map(v => v.pulse_rate),
      borderColor: '#0D9B82',
      backgroundColor: 'rgba(13,155,130,.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#0D9B82',
      pointRadius: 5,
    }]
  };

  const sugarData = {
    labels: chartLabels,
    datasets: [{
      label: 'Blood Sugar (mg/dL)',
      data: vitals.slice().reverse().map(v => v.blood_sugar),
      borderColor: '#7C3AED',
      backgroundColor: 'rgba(124,58,237,.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#7C3AED',
      pointRadius: 5,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { grid: { color: '#F1F5F9' } }, x: { grid: { display: false } } }
  };

  const tabs = [
    { id:'profile', icon:'fa-user-circle', label:'Health Profile' },
    { id:'vitals', icon:'fa-heartbeat', label:'Vitals & Charts' },
    { id:'emergency', icon:'fa-phone', label:'Emergency Info' },
    { id:'insurance', icon:'fa-shield-alt', label:'Insurance' },
  ];

  if (loading) return (
    <div style={{padding:60,textAlign:'center'}}>
      <i className='fas fa-spinner fa-spin' style={{fontSize:32,color:'#0D9B82',display:'block',marginBottom:12}}/>
      Loading health records...
    </div>
  );

  return (
    <div className='fu' ref={printRef}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700}}>
            {user?.role === 'doctor' ? 'Patient Health Records' : 'My Health Records'}
          </div>
          <div style={{fontSize:13,color:'var(--text-3)'}}>
            {user?.role === 'doctor' ? 'View patient medical profiles' : 'Your complete medical profile'}
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          {user?.role === 'patient' && (
            <>
              <button onClick={shareRecord} disabled={sharing} style={{display:'flex',alignItems:'center',gap:7,padding:'9px 16px',background:'#EDE9FE',color:'#7C3AED',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                <i className='fas fa-share-alt'/>
                {sharing ? 'Generating...' : 'Share Link'}
              </button>
              <button onClick={downloadPDF} style={{display:'flex',alignItems:'center',gap:7,padding:'9px 16px',background:'#FFE4E6',color:'#F43F5E',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                <i className='fas fa-file-pdf'/> Download PDF
              </button>
              <button onClick={save} disabled={saving} style={{display:'flex',alignItems:'center',gap:7,padding:'9px 16px',background:tg,color:'white',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                <i className='fas fa-save'/>
                {saving ? 'Saving...' : 'Save All'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Share URL display */}
      {shareUrl && (
        <div style={{background:'#E6F7F4',border:'1px solid #0D9B82',borderRadius:10,padding:'12px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
          <i className='fas fa-link' style={{color:'#0D9B82'}}/>
          <span style={{fontSize:13,color:'#0A7A67',flex:1,wordBreak:'break-all'}}>{shareUrl}</span>
          <button onClick={()=>{navigator.clipboard.writeText(shareUrl);toast('Copied!','success');}} style={{padding:'5px 12px',background:'#0D9B82',color:'white',border:'none',borderRadius:7,fontSize:12,cursor:'pointer',fontWeight:700}}>Copy</button>
        </div>
      )}

      {/* Doctor: Patient selector */}
      {user?.role === 'doctor' && patients.length > 0 && (
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 16px',marginBottom:16}}>
          <label style={lStyle}>Select Patient</label>
          <select style={iStyle} onChange={e=>loadPatientRecord(e.target.value)}>
            {patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {selectedPatient && (
            <div style={{marginTop:10,display:'flex',alignItems:'center',gap:10,padding:'10px',background:'var(--surface-2)',borderRadius:9}}>
              <div style={{width:36,height:36,borderRadius:9,background:tg,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:13}}>
                {selectedPatient.name?.slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>{selectedPatient.name}</div>
                <div style={{fontSize:11,color:'var(--text-3)'}}>{selectedPatient.email}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BMI Stats */}
      {(form.height_cm || form.weight_kg || form.blood_group) && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'BMI',val:bmi||'--',sub:bmiStatus?.label||'',color:bmiStatus?.color||'#94A3B8'},
            {label:'Height',val:form.height_cm?form.height_cm+'cm':'--',color:'#0D9B82'},
            {label:'Weight',val:form.weight_kg?form.weight_kg+'kg':'--',color:'#7C3AED'},
            {label:'Blood Group',val:form.blood_group||'--',color:'#F43F5E'},
          ].map(c=>(
            <div key={c.label} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,padding:'16px',textAlign:'center'}}>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:26,fontWeight:800,color:c.color}}>{c.val}</div>
              <div style={{fontSize:11,color:'var(--text-3)',fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginTop:4}}>{c.label}</div>
              {c.sub && <div style={{fontSize:11,color:c.color,fontWeight:600}}>{c.sub}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{display:'flex',gap:4,background:'var(--surface-2)',borderRadius:12,padding:4,marginBottom:20}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:1,padding:'9px',border:'none',borderRadius:9,fontFamily:'DM Sans,sans-serif',fontSize:12,fontWeight:600,cursor:'pointer',background:activeTab===t.id?'white':'transparent',color:activeTab===t.id?'#0D9B82':'#64748B',boxShadow:activeTab===t.id?'0 1px 4px rgba(0,0,0,.1)':'none',transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
            <i className={'fas '+t.icon}/>{t.label}
          </button>
        ))}
      </div>

      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:24}}>
        {activeTab === 'profile' && (
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,marginBottom:20}}>Basic Health Info</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:16}}>
              <div>
                <label style={lStyle}>Blood Group</label>
                <select style={iStyle} value={form.blood_group || ''} onChange={e=>set('blood_group',e.target.value)} disabled={user?.role==='doctor'}>
                  <option value=''>Select</option>
                  {bloodGroups.map(g=><option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={lStyle}>Height (cm)</label>
                <input style={iStyle} type='number' placeholder='170' value={form.height_cm || ''} onChange={e=>set('height_cm',e.target.value)} disabled={user?.role==='doctor'}/>
              </div>
              <div>
                <label style={lStyle}>Weight (kg)</label>
                <input style={iStyle} type='number' placeholder='70' value={form.weight_kg || ''} onChange={e=>set('weight_kg',e.target.value)} disabled={user?.role==='doctor'}/>
              </div>
            </div>
            {[
              {k:'allergies',label:'Known Allergies',ph:'e.g. Penicillin, Peanuts...'},
              {k:'chronic_conditions',label:'Chronic Conditions',ph:'e.g. Diabetes, Hypertension...'},
              {k:'current_medications',label:'Current Medications',ph:'e.g. Metformin 500mg...'},
              {k:'notes',label:'Additional Notes',ph:'Any other information...'},
            ].map(f=>(
              <div key={f.k} style={{marginBottom:16}}>
                <label style={lStyle}>{f.label}</label>
                <textarea style={{...iStyle,resize:'vertical'}} rows={2} placeholder={f.ph} value={form[f.k] || ""} onChange={e=>set(f.k,e.target.value)} disabled={user?.role==='doctor'}/>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'vitals' && (
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,marginBottom:20}}>Vitals & Charts</div>
            {vitals.length === 0 ? (
              <div style={{textAlign:'center',padding:'40px',color:'var(--text-3)'}}>
                <i className='fas fa-heartbeat' style={{fontSize:40,display:'block',marginBottom:12,color:'#0D9B82'}}/>
                <div style={{fontSize:14,fontWeight:600,marginBottom:6,color:'var(--text)'}}>No vitals recorded yet</div>
                <div style={{fontSize:13}}>Doctor will record vitals during visits</div>
              </div>
            ) : (
              <>
                {/* Charts */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
                  <div style={{background:'var(--surface-2)',borderRadius:12,padding:16}}>
                    <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:'#0D9B82'}}>Pulse Rate Trend</div>
                    <Line data={pulseData} options={chartOptions}/>
                  </div>
                  <div style={{background:'var(--surface-2)',borderRadius:12,padding:16}}>
                    <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:'#7C3AED'}}>Blood Sugar Trend</div>
                    <Line data={sugarData} options={chartOptions}/>
                  </div>
                </div>

                {/* Vitals table */}
                <div style={{fontFamily:'Syne,sans-serif',fontSize:14,fontWeight:700,marginBottom:12}}>Vitals History</div>
                {vitals.map((v,i) => (
                  <div key={i} style={{padding:'14px',background:'var(--surface-2)',borderRadius:12,marginBottom:10,border:'1px solid var(--border)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                      <div style={{fontSize:13,fontWeight:600}}>By {v.recorded_by_name||'Doctor'}</div>
                      <div style={{fontSize:12,color:'var(--text-3)'}}>{new Date(v.recorded_at).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8}}>
                      {[
                        {label:'BP',val:v.blood_pressure,unit:'mmHg',color:'#F43F5E'},
                        {label:'Pulse',val:v.pulse_rate,unit:'bpm',color:'#0D9B82'},
                        {label:'Temp',val:v.temperature,unit:'C',color:'#F59E0B'},
                        {label:'SpO2',val:v.oxygen_saturation,unit:'%',color:'#0EA5E9'},
                        {label:'Sugar',val:v.blood_sugar,unit:'mg/dL',color:'#7C3AED'},
                      ].map(m=>(
                        <div key={m.label} style={{textAlign:'center',background:'var(--surface)',borderRadius:9,padding:'10px',border:'1px solid var(--border)'}}>
                          <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,color:m.color}}>{m.val||'--'}</div>
                          <div style={{fontSize:10,color:'var(--text-3)'}}>{m.label}</div>
                          <div style={{fontSize:9,color:'#CBD5E1'}}>{m.unit}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Doctor can add vitals */}
            {user?.role === 'doctor' && selectedPatient && (
              <AddVitalsForm patientId={selectedPatient?.id} onSaved={loadData}/>
            )}
          </div>
        )}

        {activeTab === 'emergency' && (
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,marginBottom:20}}>Emergency Contact</div>
            <div style={{background:'#FFF7ED',border:'1px solid #FED7AA',borderRadius:12,padding:'14px 16px',marginBottom:20}}>
              <div style={{fontSize:13,color:'#92400E'}}>Used in case of medical emergency. Keep updated.</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div>
                <label style={lStyle}>Contact Name</label>
                <input style={iStyle} placeholder='Full name' value={form.emergency_contact_name || ''} onChange={e=>set('emergency_contact_name',e.target.value)} disabled={user?.role==='doctor'}/>
              </div>
              <div>
                <label style={lStyle}>Relationship</label>
                <select style={iStyle} value={form.emergency_contact_relation || ''} onChange={e=>set('emergency_contact_relation',e.target.value)} disabled={user?.role==='doctor'}>
                  <option value=''>Select</option>
                  {['Spouse','Parent','Child','Sibling','Friend','Other'].map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={lStyle}>Contact Phone</label>
              <input style={iStyle} placeholder='+91 98765 43210' value={form.emergency_contact_phone || ''} onChange={e=>set('emergency_contact_phone',e.target.value)} disabled={user?.role==='doctor'}/>
            </div>
          </div>
        )}

        {activeTab === 'insurance' && (
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,marginBottom:20}}>Insurance Details</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div>
                <label style={lStyle}>Insurance Provider</label>
                <input style={iStyle} placeholder='e.g. Star Health' value={form.insurance_provider || ''} onChange={e=>set('insurance_provider',e.target.value)} disabled={user?.role==='doctor'}/>
              </div>
              <div>
                <label style={lStyle}>Policy Number</label>
                <input style={iStyle} placeholder='e.g. SH1234567890' value={form.insurance_number || ''} onChange={e=>set('insurance_number',e.target.value)} disabled={user?.role==='doctor'}/>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddVitalsForm({ patientId, onSaved }) {
  const [form, setForm] = useState({ blood_pressure:'', pulse_rate:'', temperature:'', oxygen_saturation:'', blood_sugar:'', notes:'' });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const save = async () => {
    setSaving(true);
    try {
      const { default: api } = await import('../../services/api');
      const { toast } = await import('../../components/ToastStack');
      await api.post('/health/vitals', { ...form, patient_id: patientId });
      toast('Vitals recorded!', 'success');
      setForm({ blood_pressure:'', pulse_rate:'', temperature:'', oxygen_saturation:'', blood_sugar:'', notes:'' });
      onSaved();
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  };

  const iS = { width:'100%', padding:'9px 12px', background:'var(--surface)', border:'1.5px solid var(--border)', borderRadius:9, fontSize:13, outline:'none', fontFamily:'DM Sans,sans-serif' };

  return (
    <div style={{marginTop:20,background:'#EDE9FE',borderRadius:14,padding:20,border:'1px solid #C4B5FD'}}>
      <div style={{fontFamily:'Syne,sans-serif',fontSize:14,fontWeight:700,color:'#7C3AED',marginBottom:14}}>Record New Vitals</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:10}}>
        {[
          {k:'blood_pressure',ph:'BP (e.g. 120/80)'},
          {k:'pulse_rate',ph:'Pulse (bpm)',type:'number'},
          {k:'temperature',ph:'Temp (C)',type:'number'},
          {k:'oxygen_saturation',ph:'SpO2 (%)',type:'number'},
          {k:'blood_sugar',ph:'Sugar (mg/dL)',type:'number'},
          {k:'notes',ph:'Notes'},
        ].map(f=>(
          <input key={f.k} style={iS} placeholder={f.ph} type={f.type||'text'} value={form[f.k] || ''} onChange={e=>set(f.k,e.target.value)}/>
        ))}
      </div>
      <button onClick={save} disabled={saving} style={{padding:'9px 20px',background:'linear-gradient(135deg,#7C3AED,#A78BFA)',color:'white',border:'none',borderRadius:9,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer'}}>
        <i className='fas fa-save' style={{marginRight:6}}/>{saving?'Saving...':'Record Vitals'}
      </button>
    </div>
  );
}
