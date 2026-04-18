
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from '../../components/ToastStack';

const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

function StarRating({ value, onChange, size=24 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{display:'flex',gap:4}}>
      {[1,2,3,4,5].map(star => (
        <i
          key={star}
          className={'fas fa-star'}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{
            fontSize:size,
            color:(hover||value)>=star?'#F59E0B':'#E2E8F0',
            cursor:onChange?'pointer':'default',
            transition:'color .15s'
          }}
        />
      ))}
    </div>
  );
}

function RatingBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count/total)*100) : 0;
  return (
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
      <div style={{fontSize:12,color:'#64748B',width:40,textAlign:'right'}}>{label}</div>
      <div style={{flex:1,height:8,background:'#F1F5F9',borderRadius:99,overflow:'hidden'}}>
        <div style={{height:'100%',width:pct+'%',background:color||'#F59E0B',borderRadius:99,transition:'width .5s'}}/>
      </div>
      <div style={{fontSize:12,color:'#94A3B8',width:24}}>{count}</div>
    </div>
  );
}

export default function ReviewsPanel({ role }) {
  const [reviews, setReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [completedAppts, setCompletedAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ doctor_id:'', appointment_id:'', rating:0, review_text:'', is_anonymous:false });
  const [submitting, setSubmitting] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorStats, setDoctorStats] = useState(null);

  useEffect(() => {
    loadData();
  }, [role]);

  const loadData = async () => {
    try {
      if (role === 'patient') {
        const [r1, r2] = await Promise.all([
          api.get('/reviews/my'),
          api.get('/appointments')
        ]);
        setMyReviews(r1.data.reviews || []);
        const completed = (r2.data.appointments||[]).filter(a=>a.status==='completed');
        setCompletedAppts(completed);
      } else if (role === 'doctor') {
        const me = await api.get('/auth/me');
        const docId = me.data.user?.doctor_id;
        if (docId) loadDoctorReviews(docId);
      }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadDoctorReviews = async (docId) => {
    try {
      const r = await api.get('/reviews/doctor/' + docId);
      setReviews(r.data.reviews || []);
      setDoctorStats(r.data.stats);
    } catch(e) { console.error(e); }
  };

  const loadReviewsForDoctor = async (docId, docName) => {
    setSelectedDoctor(docName);
    try {
      const r = await api.get('/reviews/doctor/' + docId);
      setReviews(r.data.reviews || []);
      setDoctorStats(r.data.stats);
    } catch(e) { console.error(e); }
  };

  const submitReview = async () => {
    if (!form.doctor_id) { toast('Select a doctor', 'warning'); return; }
    if (!form.rating) { toast('Please give a rating', 'warning'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', form);
      toast('Review submitted! Thank you.', 'success');
      setShowForm(false);
      setForm({ doctor_id:'', appointment_id:'', rating:0, review_text:'', is_anonymous:false });
      loadData();
    } catch(e) {
      toast(e.response?.data?.message || 'Failed to submit review', 'error');
    } finally { setSubmitting(false); }
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete('/reviews/' + id);
      toast('Review deleted', 'success');
      loadData();
    } catch(e) { toast('Failed to delete', 'error'); }
  };

  const getRatingColor = (r) => r>=4.5?'#10B981':r>=3.5?'#F59E0B':r>=2.5?'#F97316':'#F43F5E';

  if (loading) return (
    <div style={{padding:60,textAlign:'center'}}>
      <i className='fas fa-spinner fa-spin' style={{fontSize:32,color:'#0D9B82',display:'block',marginBottom:12}}/>
    </div>
  );

  // DOCTOR VIEW
  if (role === 'doctor') return (
    <div className='fu'>
      <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700,marginBottom:20}}>My Reviews</div>

      {/* Stats Card */}
      {doctorStats && (
        <div style={{background:'white',border:'1px solid #E2E8F0',borderRadius:20,padding:24,marginBottom:20,display:'grid',gridTemplateColumns:'auto 1fr',gap:24,alignItems:'center'}}>
          <div style={{textAlign:'center',padding:'0 24px',borderRight:'1px solid #E2E8F0'}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:64,fontWeight:900,color:getRatingColor(parseFloat(doctorStats.avg_rating)),lineHeight:1}}>
              {doctorStats.avg_rating||'0'}
            </div>
            <StarRating value={Math.round(doctorStats.avg_rating)} size={18}/>
            <div style={{fontSize:13,color:'#94A3B8',marginTop:6}}>{doctorStats.total} reviews</div>
          </div>
          <div>
            {[
              {label:'5 stars',count:parseInt(doctorStats.five_star),color:'#10B981'},
              {label:'4 stars',count:parseInt(doctorStats.four_star),color:'#0D9B82'},
              {label:'3 stars',count:parseInt(doctorStats.three_star),color:'#F59E0B'},
              {label:'2 stars',count:parseInt(doctorStats.two_star),color:'#F97316'},
              {label:'1 star',count:parseInt(doctorStats.one_star),color:'#F43F5E'},
            ].map(r=>(
              <RatingBar key={r.label} label={r.label} count={r.count} total={parseInt(doctorStats.total)} color={r.color}/>
            ))}
          </div>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div style={{background:'white',border:'1px solid #E2E8F0',borderRadius:16,padding:'48px',textAlign:'center',color:'#94A3B8'}}>
          <i className='fas fa-star' style={{fontSize:40,display:'block',marginBottom:12,color:'#F59E0B'}}/>
          <div style={{fontSize:15,fontWeight:600,color:'#0A1628',marginBottom:6}}>No reviews yet</div>
          <div style={{fontSize:13}}>Reviews appear after patients complete appointments</div>
        </div>
      ) : reviews.map((r,i) => (
        <div key={i} style={{background:'white',border:'1px solid #E2E8F0',borderRadius:16,padding:20,marginBottom:12}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
            <div style={{width:40,height:40,borderRadius:10,background:tg,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:14,flexShrink:0}}>
              {r.is_anonymous ? 'AN' : r.patient_name?.slice(0,2).toUpperCase()}
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:14}}>{r.patient_name}</div>
              <div style={{fontSize:11,color:'#94A3B8'}}>{new Date(r.created_at).toLocaleDateString('en-IN',{dateStyle:'medium'})}</div>
            </div>
            <StarRating value={r.rating} size={16}/>
          </div>
          {r.review_text && <p style={{fontSize:14,color:'#475569',lineHeight:1.6,margin:0,padding:'12px',background:'#F8FAFC',borderRadius:10}}>{r.review_text}</p>}
        </div>
      ))}
    </div>
  );

  // PATIENT VIEW
  return (
    <div className='fu'>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700}}>My Reviews</div>
        {completedAppts.length > 0 && (
          <button onClick={()=>setShowForm(true)} style={{display:'flex',alignItems:'center',gap:7,padding:'10px 18px',background:tg,color:'white',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:700,cursor:'pointer'}}>
            <i className='fas fa-star'/> Write Review
          </button>
        )}
      </div>

      {/* Write Review Form */}
      {showForm && (
        <div style={{background:'white',border:'2px solid #0D9B82',borderRadius:20,padding:24,marginBottom:20}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,marginBottom:16}}>Write a Review</div>

          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:12,fontWeight:700,color:'#64748B',marginBottom:6,textTransform:'uppercase'}}>Select Doctor</label>
            <select
              style={{width:'100%',padding:'11px 14px',background:'#F8FAFC',border:'1.5px solid #E2E8F0',borderRadius:10,fontSize:14,outline:'none',fontFamily:'DM Sans,sans-serif'}}
              value={form.doctor_id}
              onChange={e=>{
                const appt = completedAppts.find(a=>a.doctor_id===e.target.value);
                setForm(f=>({...f,doctor_id:e.target.value,appointment_id:appt?.id||''}));
                if(e.target.value) loadReviewsForDoctor(e.target.value, '');
              }}
            >
              <option value=''>Choose a doctor you visited</option>
              {[...new Map(completedAppts.map(a=>[a.doctor_id,a])).values()].map(a=>(
                <option key={a.doctor_id} value={a.doctor_id}>{a.doctor_name}</option>
              ))}
            </select>
          </div>

          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:12,fontWeight:700,color:'#64748B',marginBottom:8,textTransform:'uppercase'}}>Your Rating</label>
            <StarRating value={form.rating} onChange={v=>setForm(f=>({...f,rating:v}))} size={32}/>
            <div style={{fontSize:13,color:'#94A3B8',marginTop:6}}>
              {form.rating===5?'Excellent!':form.rating===4?'Very Good':form.rating===3?'Good':form.rating===2?'Fair':form.rating===1?'Poor':'Click to rate'}
            </div>
          </div>

          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:12,fontWeight:700,color:'#64748B',marginBottom:6,textTransform:'uppercase'}}>Your Review (optional)</label>
            <textarea
              placeholder='Share your experience with this doctor...'
              rows={3}
              value={form.review_text}
              onChange={e=>setForm(f=>({...f,review_text:e.target.value}))}
              style={{width:'100%',padding:'11px 14px',background:'#F8FAFC',border:'1.5px solid #E2E8F0',borderRadius:10,fontSize:14,outline:'none',fontFamily:'DM Sans,sans-serif',resize:'vertical'}}
            />
          </div>

          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:20,cursor:'pointer'}} onClick={()=>setForm(f=>({...f,is_anonymous:!f.is_anonymous}))}>
            <div style={{width:20,height:20,borderRadius:5,border:'2px solid',borderColor:form.is_anonymous?'#0D9B82':'#E2E8F0',background:form.is_anonymous?'#0D9B82':'white',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {form.is_anonymous && <i className='fas fa-check' style={{color:'white',fontSize:11}}/>}
            </div>
            <span style={{fontSize:13,color:'#64748B'}}>Post anonymously</span>
          </div>

          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>setShowForm(false)} style={{flex:1,padding:'11px',background:'#F1F5F9',color:'#64748B',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:600,cursor:'pointer'}}>
              Cancel
            </button>
            <button onClick={submitReview} disabled={submitting||!form.rating||!form.doctor_id}
              style={{flex:2,padding:'11px',background:tg,color:'white',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:700,cursor:'pointer',opacity:submitting||!form.rating||!form.doctor_id?0.7:1}}>
              {submitting?'Submitting...':'Submit Review'}
            </button>
          </div>
        </div>
      )}

      {/* My Reviews */}
      {myReviews.length === 0 && !showForm ? (
        <div style={{background:'white',border:'1px solid #E2E8F0',borderRadius:16,padding:'48px',textAlign:'center',color:'#94A3B8'}}>
          <i className='fas fa-star' style={{fontSize:40,display:'block',marginBottom:12,color:'#F59E0B'}}/>
          <div style={{fontSize:15,fontWeight:600,color:'#0A1628',marginBottom:6}}>No reviews yet</div>
          <div style={{fontSize:13,marginBottom:16}}>Complete an appointment to leave a review</div>
          {completedAppts.length > 0 && (
            <button onClick={()=>setShowForm(true)} style={{padding:'10px 20px',background:tg,color:'white',border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer'}}>
              Write Your First Review
            </button>
          )}
        </div>
      ) : myReviews.map((r,i) => (
        <div key={i} style={{background:'white',border:'1px solid #E2E8F0',borderRadius:16,padding:20,marginBottom:12}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#7C3AED,#A78BFA)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:15}}>
                {r.doctor_name?.slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{fontWeight:600,fontSize:14}}>{r.doctor_name}</div>
                <div style={{fontSize:12,color:'#94A3B8'}}>{r.speciality}</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <StarRating value={r.rating} size={14}/>
              <button onClick={()=>deleteReview(r.id)} style={{width:28,height:28,borderRadius:7,background:'#FFE4E6',border:'none',color:'#F43F5E',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <i className='fas fa-trash' style={{fontSize:11}}/>
              </button>
            </div>
          </div>
          {r.review_text && (
            <p style={{fontSize:14,color:'#475569',lineHeight:1.6,margin:0,padding:'10px 14px',background:'#F8FAFC',borderRadius:9}}>{r.review_text}</p>
          )}
          <div style={{fontSize:11,color:'#94A3B8',marginTop:8}}>{new Date(r.created_at).toLocaleDateString('en-IN',{dateStyle:'medium'})}</div>
        </div>
      ))}
    </div>
  );
}
