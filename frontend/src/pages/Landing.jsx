import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const nav = useNavigate();
  const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      <nav style={{padding:'0 40px',height:66,display:'flex',alignItems:'center',justifyContent:'space-between',background:'var(--surf)',borderBottom:'1px solid var(--bdr)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,background:tg,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}><i className='fas fa-heart-pulse' style={{color:'#fff',fontSize:16}}/></div>
          <span style={{fontFamily:'Syne,sans-serif',fontSize:19,fontWeight:700,background:tg,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>MEDIQUEUE</span>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>nav('/login')} style={{padding:'8px 18px',background:'transparent',border:'1.5px solid var(--bdr2)',borderRadius:9,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:600,cursor:'pointer',color:'var(--txt)'}}>Log In</button>
          <button onClick={()=>nav('/register')} style={{padding:'8px 18px',background:tg,border:'none',borderRadius:9,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:600,cursor:'pointer',color:'#fff',boxShadow:'0 4px 14px rgba(13,155,130,.3)'}}>Get Started Free</button>
        </div>
      </nav>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'100px 40px 60px',textAlign:'center'}}>
        <div className='fu' style={{display:'inline-flex',alignItems:'center',gap:7,background:'var(--tealXL)',color:'var(--tealDk)',padding:'5px 14px',borderRadius:999,fontSize:11,fontWeight:700,letterSpacing:.8,textTransform:'uppercase',marginBottom:22}}>
          <span style={{width:6,height:6,background:'var(--teal)',borderRadius:'50%',animation:'pulse 2s infinite'}}/> AI-Powered Healthcare OS
        </div>
        <h1 className='fu' style={{fontFamily:'Syne,sans-serif',fontSize:62,lineHeight:1.08,fontWeight:700,marginBottom:20,letterSpacing:-1}}>
          Cut Wait Times By{' '}
          <span style={{background:tg,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>70%</span>
          {' '}with Smart Queuing
        </h1>
        <p className='fu' style={{fontSize:17,lineHeight:1.75,color:'var(--txt2)',marginBottom:36,maxWidth:540,margin:'0 auto 36px'}}>
          MEDIQUEUE uses AI to predict, manage, and streamline patient flow — giving clinics world-class tools without the waiting room chaos.
        </p>
        <div className='fu' style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={()=>nav('/login')} style={{padding:'14px 28px',background:tg,color:'#fff',border:'none',borderRadius:12,fontFamily:'DM Sans,sans-serif',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 20px rgba(13,155,130,.35)',display:'flex',alignItems:'center',gap:8}}>
            <i className='fas fa-calendar-check'/> Book Appointment
          </button>
          <button onClick={()=>nav('/register')} style={{padding:'14px 28px',background:'transparent',color:'var(--txt)',border:'1.5px solid var(--bdr2)',borderRadius:12,fontFamily:'DM Sans,sans-serif',fontSize:15,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
            <i className='fas fa-user-plus'/> Create Account
          </button>
        </div>
        <div style={{display:'flex',gap:28,justifyContent:'center',marginTop:32,fontSize:13,color:'var(--txt3)'}}>
          {[['shield-check','#10B981','HIPAA Compliant'],['lock','#10B981','End-to-End Encrypted'],['star','#F59E0B','4.9 Rated']].map(([ic,c,l])=>(
            <span key={l} style={{display:'flex',alignItems:'center',gap:5}}><i className={'fas fa-'+ic} style={{color:c}}/>{l}</span>
          ))}
        </div>
      </div>
      <div style={{background:'#0A1628',padding:'52px 40px'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:32,textAlign:'center'}}>
          {[['500+','Partner Clinics'],['70%','Wait Time Reduction'],['2M+','Patients Served'],['4.9★','Average Rating']].map(([n,l])=>(
            <div key={l}><div style={{fontFamily:'Syne,sans-serif',fontSize:44,fontWeight:700,background:tg,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{n}</div><div style={{fontSize:13,color:'#94A3B8',marginTop:4}}>{l}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}