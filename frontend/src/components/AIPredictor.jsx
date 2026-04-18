
import { useState, useEffect } from 'react';
import api from '../services/api';

const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

export default function AIPredictor({ position, appointmentType, completedToday, show }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show || !position) return;
    const predict = async () => {
      setLoading(true);
      try {
        const r = await api.post('/ai/predict', {
          position,
          appointmentType: appointmentType || 'in_person',
          completedToday: completedToday || 0,
          doctorSpeedFactor: 1.0
        });
        setPrediction(r.data.prediction);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    predict();
    const interval = setInterval(predict, 30000);
    return () => clearInterval(interval);
  }, [position, show]);

  if (!show || !position) return null;

  const confidenceColor = {
    high: '#10B981',
    medium: '#F59E0B', 
    low: '#F43F5E'
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg,#0A1628,#1E3A5F)',
      borderRadius: 16,
      padding: 20,
      marginTop: 16,
      border: '1px solid rgba(13,155,130,.3)'
    }}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
        <div style={{width:36,height:36,borderRadius:10,background:'rgba(13,155,130,.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <i className='fas fa-brain' style={{color:'#0D9B82',fontSize:16}}/>
        </div>
        <div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:14,fontWeight:700,color:'white'}}>AI Prediction</div>
          <div style={{fontSize:11,color:'#94A3B8'}}>Machine learning model</div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:99,background:'rgba(13,155,130,.15)'}}>
          <span style={{width:5,height:5,borderRadius:'50%',background:'#10B981',display:'inline-block'}}/>
          <span style={{fontSize:10,fontWeight:700,color:'#10B981'}}>LIVE</span>
        </div>
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:'10px 0',color:'#94A3B8',fontSize:13}}>
          <i className='fas fa-spinner fa-spin' style={{marginRight:6}}/>
          Calculating...
        </div>
      ) : prediction ? (
        <>
          <div style={{textAlign:'center',marginBottom:16}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:48,fontWeight:900,color:'#0D9B82',lineHeight:1}}>
              {prediction.estimatedMinutes}
            </div>
            <div style={{fontSize:13,color:'#94A3B8',marginTop:4}}>minutes estimated wait</div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
            <div style={{background:'rgba(255,255,255,.05)',borderRadius:10,padding:'10px 12px'}}>
              <div style={{fontSize:10,color:'#64748B',marginBottom:3,textTransform:'uppercase',letterSpacing:.5}}>Confidence</div>
              <div style={{fontSize:13,fontWeight:700,color:confidenceColor[prediction.confidence]}}>
                {prediction.confidence === 'high' ? 'High (95%)' : prediction.confidence === 'medium' ? 'Medium (75%)' : 'Low (50%)'}
              </div>
            </div>
            <div style={{background:'rgba(255,255,255,.05)',borderRadius:10,padding:'10px 12px'}}>
              <div style={{fontSize:10,color:'#64748B',marginBottom:3,textTransform:'uppercase',letterSpacing:.5}}>Your Position</div>
              <div style={{fontSize:13,fontWeight:700,color:'white'}}>#{position} in queue</div>
            </div>
          </div>

          <div style={{background:'rgba(255,255,255,.03)',borderRadius:10,padding:12}}>
            <div style={{fontSize:11,fontWeight:700,color:'#64748B',marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Prediction Factors</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {[
                {label:'Base consultation time',val:prediction.factors.baseConsultationTime+'min'},
                {label:'Time of day factor',val:'x'+prediction.factors.timeOfDayMultiplier.toFixed(1)},
                {label:'Day of week factor',val:'x'+prediction.factors.dayOfWeekMultiplier.toFixed(1)},
                {label:'Doctor speed factor',val:'x'+prediction.factors.doctorSpeedFactor.toFixed(1)},
              ].map(f => (
                <div key={f.label} style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
                  <span style={{color:'#94A3B8'}}>{f.label}</span>
                  <span style={{color:'white',fontWeight:600}}>{f.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{marginTop:12,padding:'8px 12px',background:'rgba(13,155,130,.1)',borderRadius:8,fontSize:12,color:'#1DBEA0',textAlign:'center'}}>
            <i className='fas fa-info-circle' style={{marginRight:6}}/>
            Updates every 30 seconds automatically
          </div>
        </>
      ) : null}
    </div>
  );
}
