import { useState, useEffect } from 'react';
import { appointmentAPI } from '../../services/api';
import api from '../../services/api';
import { toast } from '../../components/ToastStack';
const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';
export default function PaymentsPanel() {
  const [payments, setPayments] = useState([]);
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  useEffect(() => {
    const load = async () => {
      try {
        const [p, a] = await Promise.all([api.get('/payments'), appointmentAPI.getAll()]);
        setPayments(p.data.payments || []);
        setAppts((a.data.appointments || []).filter(x => x.status === 'confirmed'));
      } catch(e) { console.error(e); } finally { setLoading(false); }
    };
    load();
  }, []);
  const payNow = async (appt) => {
    setPaying(true);
    try {
      const r = await api.post('/payments/create-order', { appointment_id: appt.id, amount: appt.consultation_fee || 500 });
      const { order, key_id } = r.data;
      const options = {
        key: key_id,
        amount: order.amount,
        currency: 'INR',
        name: 'MEDIQUEUE',
        description: 'Consultation Fee',
        order_id: order.id,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', response);
            toast('Payment successful! ', 'success');
          } catch(e) { toast('Verification failed', 'error'); }
        },
        prefill: { name: 'Patient', email: 'patient@mediqueue.com' },
        theme: { color: '#0D9B82' }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch(e) { toast('Payment failed: ' + (e.response?.data?.message || e.message), 'error'); }
    finally { setPaying(false); }
  };
  if (loading) return <div style={{padding:40,color:'var(--text-2)',fontSize:14}}>Loading payments...</div>;
  return (
    <div className='fu'>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,padding:18}}><div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:.6,marginBottom:7}}>Total Paid</div><div style={{fontFamily:'Syne,sans-serif',fontSize:26,fontWeight:700,color:'#0D9B82'}}>{payments.filter(p=>p.status==='paid').reduce((a,p)=>a+parseFloat(p.amount||0),0).toLocaleString()}</div></div>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,padding:18}}><div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:.6,marginBottom:7}}>Transactions</div><div style={{fontFamily:'Syne,sans-serif',fontSize:26,fontWeight:700}}>{payments.length}</div></div>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,padding:18}}><div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:.6,marginBottom:7}}>Pending</div><div style={{fontFamily:'Syne,sans-serif',fontSize:26,fontWeight:700,color:'#F59E0B'}}>{payments.filter(p=>p.status==='pending').length}</div></div>
      </div>
      {appts.length > 0 && (
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:22,marginBottom:20}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,marginBottom:16}}>Pay Now</div>
          {appts.map(a=>(
            <div key={a.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px',background:'var(--surface-2)',borderRadius:12,marginBottom:10}}>
              <div><div style={{fontWeight:600,fontSize:14,marginBottom:3}}>{a.doctor_name||'Doctor'}</div><div style={{fontSize:12,color:'var(--text-3)'}}>{new Date(a.appointment_time).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</div></div>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,color:'#0D9B82'}}>{a.consultation_fee||500}</div>
                <button onClick={()=>payNow(a)} disabled={paying} style={{padding:'8px 18px',background:tg,color:'#fff',border:'none',borderRadius:9,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer'}}>{paying?'Processing...':'Pay Now'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden'}}>
        <div style={{padding:'18px 22px',borderBottom:'1px solid var(--border)',fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700}}>Payment History</div>
        {payments.length===0?(
          <div style={{textAlign:'center',padding:'40px 0',color:'var(--text-3)',fontSize:14}}><i className='fas fa-credit-card' style={{fontSize:36,display:'block',marginBottom:12}}/>No payments yet</div>
        ):(
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Date','Amount','Status'].map(h=>(<th key={h} style={{fontSize:11,fontWeight:700,letterSpacing:.7,textTransform:'uppercase',color:'var(--text-3)',padding:'10px 14px',borderBottom:'1px solid var(--border)',textAlign:'left'}}>{h}</th>))}</tr></thead>
            <tbody>{payments.map((p,i)=>(
              <tr key={i} style={{borderBottom:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'12px 14px',fontSize:13}}>{p.paid_at?new Date(p.paid_at).toLocaleDateString('en-IN'):''}</td>
                <td style={{padding:'12px 14px',fontSize:13,fontWeight:700,color:'#0D9B82'}}>{parseFloat(p.amount||0).toLocaleString()}</td>
                <td style={{padding:'12px 14px'}}><span style={{fontSize:11,padding:'3px 9px',borderRadius:99,fontWeight:700,background:p.status==='paid'?'#D1FAE5':'#FEF3C7',color:p.status==='paid'?'#065F46':'#92400E'}}>{p.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}