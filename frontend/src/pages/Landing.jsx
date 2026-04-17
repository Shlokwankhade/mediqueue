
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const nav = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [count, setCount] = useState({patients:0,doctors:0,clinics:0,rating:0});

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const targets = {patients:2000,doctors:50,clinics:500,rating:49};
    const duration = 2000;
    const steps = 60;
    const interval = duration/steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step/steps;
      setCount({
        patients: Math.round(targets.patients * progress),
        doctors: Math.round(targets.doctors * progress),
        clinics: Math.round(targets.clinics * progress),
        rating: Math.round(targets.rating * progress)
      });
      if(step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const toggleDark = () => {
    const d = !dark;
    setDark(d);
    document.documentElement.setAttribute('data-theme', d ? 'dark' : 'light');
  };

  const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

  return (
    <div style={{minHeight:'100vh',fontFamily:'DM Sans,sans-serif',background:'var(--bg)',color:'var(--txt)'}}>

      {/* -- NAVBAR -- */}
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:999,
        height:68,padding:'0 48px',
        display:'flex',alignItems:'center',justifyContent:'space-between',
        background:scrolled?'rgba(255,255,255,.97)':'rgba(255,255,255,.0)',
        backdropFilter:scrolled?'blur(20px)':'none',
        borderBottom:scrolled?'1px solid rgba(0,0,0,.08)':'none',
        transition:'all .3s'
      }}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:38,height:38,background:tg,borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <i className='fas fa-heart-pulse' style={{color:'white',fontSize:17}}/>
          </div>
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:17,background:tg,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>MEDIQUEUE</div>
            <div style={{fontSize:8,color:'#94A3B8',letterSpacing:1,textTransform:'uppercase',fontWeight:600,marginTop:-2}}>Digital Queue System</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:28}}>
          {['Features','How It Works','Pricing','About'].map(l=>(
            <a key={l} href={'#'+l.toLowerCase().replace(/ /g,'-')} style={{fontSize:14,fontWeight:500,color:'var(--txt2)',textDecoration:'none',transition:'color .2s'}}
              onMouseEnter={e=>e.target.style.color='#0D9B82'}
              onMouseLeave={e=>e.target.style.color='var(--txt2)'}>{l}</a>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <button onClick={toggleDark} style={{width:36,height:36,borderRadius:9,border:'1px solid #E2E8F0',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--txt2)',fontSize:14}}>
            <i className={'fas '+(dark?'fa-sun':'fa-moon')}/>
          </button>
          <button onClick={()=>nav('/login')} style={{padding:'8px 18px',background:'transparent',border:'1.5px solid #E2E8F0',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontWeight:600,fontSize:13,cursor:'pointer',color:'var(--txt)'}}>
            Log In
          </button>
          <button onClick={()=>nav('/register')} style={{padding:'8px 18px',background:tg,border:'none',borderRadius:10,fontFamily:'DM Sans,sans-serif',fontWeight:700,fontSize:13,cursor:'pointer',color:'white',boxShadow:'0 4px 14px rgba(13,155,130,.35)'}}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* -- HERO -- */}
      <section style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'130px 48px 80px',background:'linear-gradient(160deg,#f0fdf9 0%,#f8fafc 50%,#fdf4ff 100%)'}}>
        <div style={{maxWidth:1200,width:'100%',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center'}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'#E6F7F4',color:'#0A7A67',padding:'6px 14px',borderRadius:99,fontSize:12,fontWeight:700,letterSpacing:.8,textTransform:'uppercase',marginBottom:24}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#0D9B82',display:'inline-block',animation:'pulse 2s infinite'}}/>
              AI-Powered Healthcare System
            </div>
            <h1 style={{fontFamily:'Syne,sans-serif',fontSize:58,fontWeight:800,lineHeight:1.08,marginBottom:20,letterSpacing:-1.5,color:'#0A1628'}}>
              Mediqueue:<br/>
              <span style={{background:tg,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Digital Appointment</span><br/>
              & Queue System
            </h1>
            <p style={{fontSize:17,lineHeight:1.75,color:'#64748B',marginBottom:36,maxWidth:480}}>
              Eliminate waiting room chaos. Book appointments, track real-time queue positions, and manage your healthcare journey  all in one intelligent platform.
            </p>
            <div style={{display:'flex',gap:12,marginBottom:40,flexWrap:'wrap'}}>
              <button onClick={()=>nav('/register')} style={{display:'inline-flex',alignItems:'center',gap:9,padding:'14px 28px',background:tg,border:'none',borderRadius:14,fontFamily:'DM Sans,sans-serif',fontWeight:700,fontSize:16,cursor:'pointer',color:'white',boxShadow:'0 8px 24px rgba(13,155,130,.35)',transition:'all .2s'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(13,155,130,.45)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 8px 24px rgba(13,155,130,.35)'}}>
                <i className='fas fa-calendar-check'/> Book Appointment
              </button>
              <button onClick={()=>nav('/login')} style={{display:'inline-flex',alignItems:'center',gap:9,padding:'14px 28px',background:'white',border:'2px solid #E2E8F0',borderRadius:14,fontFamily:'DM Sans,sans-serif',fontWeight:600,fontSize:16,cursor:'pointer',color:'#0A1628',transition:'all .2s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#0D9B82'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='#E2E8F0'}>
                <i className='fas fa-sign-in-alt' style={{color:'#0D9B82'}}/> Sign In
              </button>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:20,fontSize:13,color:'#94A3B8'}}>
              {[['fa-shield-check','HIPAA Compliant'],['fa-lock','End-to-End Encrypted'],['fa-star','4.9? Rated']].map(([icon,label])=>(
                <div key={label} style={{display:'flex',alignItems:'center',gap:5}}>
                  <i className={'fas '+icon} style={{color:'#0D9B82'}}/>{label}
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div style={{position:'relative'}}>
            {/* Main Card */}
            <div style={{background:'white',borderRadius:24,padding:24,boxShadow:'0 24px 64px rgba(0,0,0,.1)',border:'1px solid #E2E8F0',animation:'float 4s ease-in-out infinite'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:.8}}>Live Queue</div>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:700}}>General OPD</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6,background:'#D1FAE5',color:'#065F46',padding:'5px 12px',borderRadius:99,fontSize:12,fontWeight:700}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'#10B981',display:'inline-block'}}/>
                  Live
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:12,padding:14,background:'#F8FAFC',borderRadius:14,marginBottom:12}}>
                <div style={{width:44,height:44,borderRadius:12,background:tg,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:14}}>34</div>
                <div>
                  <div style={{fontSize:11,color:'#94A3B8',marginBottom:2}}>YOUR TOKEN</div>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700,color:'#0D9B82'}}>MQ-0034</div>
                </div>
                <div style={{marginLeft:'auto',textAlign:'right'}}>
                  <div style={{fontSize:11,color:'#94A3B8',marginBottom:2}}>POSITION</div>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700,color:'#F59E0B'}}>#3</div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:12,padding:14,background:'#F8FAFC',borderRadius:14,marginBottom:16}}>
                <div style={{width:44,height:44,borderRadius:12,background:'#FEF3C7',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <i className='fas fa-clock' style={{color:'#F59E0B',fontSize:18}}/>
                </div>
                <div>
                  <div style={{fontSize:11,color:'#94A3B8',marginBottom:2}}>ESTIMATED WAIT</div>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700,color:'#F59E0B'}}>~12 min</div>
                </div>
                <div style={{marginLeft:'auto'}}>
                  <span style={{fontSize:11,padding:'4px 10px',borderRadius:99,fontWeight:700,background:'#E6F7F4',color:'#0D9B82'}}>? 70% less</span>
                </div>
              </div>
              <div style={{height:8,background:'#E2E8F0',borderRadius:99,overflow:'hidden',marginBottom:12}}>
                <div style={{height:'100%',width:'68%',background:tg,borderRadius:99}}/>
              </div>
              <div style={{display:'flex',gap:8}}>
                {['31','32','33'].map(n=><div key={n} style={{flex:1,height:40,borderRadius:10,background:'#F1F5F9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#94A3B8',textDecoration:'line-through'}}>{n}</div>)}
                <div style={{flex:1,height:40,borderRadius:10,background:tg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'white',boxShadow:'0 4px 12px rgba(13,155,130,.4)'}}>34</div>
                <div style={{flex:1,height:40,borderRadius:10,background:'#E6F7F4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#0D9B82',border:'2px solid #0D9B82'}}>35</div>
                <div style={{flex:1,height:40,borderRadius:10,background:'#F1F5F9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#94A3B8'}}>36</div>
              </div>
            </div>

            {/* Floating badge 1 */}
            <div style={{position:'absolute',top:-20,right:-20,background:'white',borderRadius:16,padding:'14px 18px',boxShadow:'0 8px 32px rgba(0,0,0,.12)',border:'1px solid #E2E8F0',animation:'float 4s ease-in-out infinite .5s'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{width:8,height:8,borderRadius:'50%',background:'#10B981',display:'inline-block'}}/>
                <span style={{fontSize:11,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:.5}}>AI Prediction</span>
              </div>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:800,color:'#0A1628',marginTop:2}}>97.3% Accurate</div>
            </div>

            {/* Floating badge 2 */}
            <div style={{position:'absolute',bottom:-20,left:-20,background:'white',borderRadius:16,padding:'14px 18px',boxShadow:'0 8px 32px rgba(0,0,0,.12)',border:'1px solid #E2E8F0',animation:'float 4s ease-in-out infinite 1s'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                <i className='fas fa-shield-check' style={{color:'#0D9B82',fontSize:14}}/>
                <span style={{fontSize:11,fontWeight:700,color:'#94A3B8'}}>HIPAA Compliant</span>
              </div>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:800,color:'#0D9B82'}}>100% Secure</div>
            </div>
          </div>
        </div>
      </section>

      {/* -- FEATURES -- */}
      <section id='features' style={{padding:'96px 48px',background:'var(--bg)'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'#E6F7F4',color:'#0A7A67',padding:'6px 14px',borderRadius:99,fontSize:12,fontWeight:700,letterSpacing:.8,textTransform:'uppercase',marginBottom:16}}>
              Everything You Need
            </div>
            <h2 style={{fontFamily:'Syne,sans-serif',fontSize:44,fontWeight:800,marginBottom:14,letterSpacing:-1,color:'#0A1628'}}>Built for Modern Healthcare</h2>
            <p style={{fontSize:17,color:'#64748B',maxWidth:540,margin:'0 auto',lineHeight:1.7}}>A complete digital healthcare ecosystem  from booking to billing, all in one powerful platform.</p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
            {[
              {icon:'brain',emoji:'??',title:'AI Wait Prediction',desc:'ML model analyzes 50+ variables to predict wait times with 97.3% accuracy. Updates every 30 seconds.',color:'#0D9B82',bg:'#E6F7F4',span:2},
              {icon:'qrcode',emoji:'??',title:'QR Check-In',desc:'Skip the front desk. Scan, done. 3-second check-in.',color:'#7C3AED',bg:'#EDE9FE',span:1},
              {icon:'video',emoji:'??',title:'Telehealth',desc:'HD video consultations built right into the platform.',color:'#0EA5E9',bg:'#DBEAFE',span:1},
              {icon:'pills',emoji:'??',title:'E-Prescriptions',desc:'Digital prescriptions sent directly to patients via email.',color:'#F43F5E',bg:'#FFE4E6',span:1},
              {icon:'chart-line',emoji:'??',title:'Live Analytics',desc:'Real-time dashboards for revenue, appointments, and patient flow.',color:'#F59E0B',bg:'#FEF3C7',span:1},
            ].map(f=>(
              <div key={f.title} style={{
                background:f.span===2?'#0A1628':'var(--surf)',
                border:f.span===2?'none':'1px solid #E2E8F0',
                borderRadius:20,padding:32,
                gridColumn:f.span===2?'span 2':'span 1',
                color:f.span===2?'white':'inherit',
                transition:'all .2s',cursor:'default'
              }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='none'}>
                <div style={{width:52,height:52,borderRadius:14,background:f.span===2?'rgba(13,155,130,.2)':f.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,marginBottom:18}}>
                  <i className={f.icon} style={{fontSize:22,color:f.color}}/>
                </div>
                <h3 style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:700,marginBottom:8}}>{f.title}</h3>
                <p style={{fontSize:14,lineHeight:1.7,color:f.span===2?'#94A3B8':'#64748B'}}>{f.desc}</p>
                {f.span===2 && (
                  <div style={{display:'flex',gap:8,marginTop:16}}>
                    <span style={{fontSize:11,padding:'4px 12px',borderRadius:99,background:'rgba(13,155,130,.2)',color:'#1DBEA0',fontWeight:700}}>97.3% Accuracy</span>
                    <span style={{fontSize:11,padding:'4px 12px',borderRadius:99,background:'rgba(255,255,255,.1)',color:'#94A3B8',fontWeight:700}}>Updates Every 30s</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- HOW IT WORKS -- */}
      <section id='how-it-works' style={{padding:'96px 48px',background:'#F8FAFC'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <h2 style={{fontFamily:'Syne,sans-serif',fontSize:44,fontWeight:800,marginBottom:14,letterSpacing:-1,color:'#0A1628'}}>Book in 60 Seconds</h2>
            <p style={{fontSize:17,color:'#64748B',lineHeight:1.7}}>Four simple steps to quality healthcare</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:24,position:'relative'}}>
            <div style={{position:'absolute',top:40,left:'15%',right:'15%',height:2,background:'linear-gradient(90deg,#0D9B82,#1DBEA0)',borderRadius:99,opacity:.3}}/>
            {[
              {n:'01',emoji:'??',title:'Choose Clinic',desc:'Select from 500+ partner clinics and hospitals near you'},
              {n:'02',emoji:'?????',title:'Pick Doctor',desc:'View ratings, expertise, fees and real-time availability'},
              {n:'03',emoji:'??',title:'Book Slot',desc:'Live calendar with instant confirmation and reminders'},
              {n:'04',emoji:'??',title:'Track Queue',desc:'Real-time queue updates via SMS, email and app'},
            ].map(s=>(
              <div key={s.n} style={{textAlign:'center',position:'relative',zIndex:1}}>
                <div style={{width:72,height:72,borderRadius:'50%',background:tg,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',boxShadow:'0 8px 24px rgba(13,155,130,.3)'}}>
                  <i className={s.icon} style={{color:'white',fontSize:24}}/>
                </div>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:11,fontWeight:800,color:'#94A3B8',letterSpacing:1,marginBottom:6}}>STEP {s.n}</div>
                <h4 style={{fontFamily:'Syne,sans-serif',fontSize:17,fontWeight:700,marginBottom:8,color:'#0A1628'}}>{s.title}</h4>
                <p style={{fontSize:13,color:'#64748B',lineHeight:1.6}}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- ROLES -- */}
      <section style={{padding:'96px 48px',background:'var(--bg)'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <h2 style={{fontFamily:'Syne,sans-serif',fontSize:44,fontWeight:800,marginBottom:14,letterSpacing:-1,color:'#0A1628'}}>Built for Everyone</h2>
            <p style={{fontSize:17,color:'#64748B',lineHeight:1.7}}>Separate powerful portals for patients, doctors and administrators</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
            {[
              {role:'Patient',icon:'fa-user',color:'#0D9B82',bg:'linear-gradient(135deg,#0D9B82,#1DBEA0)',features:['Book appointments online','Real-time queue tracking','Receive e-prescriptions','Pay consultation fees','View health records'],desc:'Take control of your healthcare journey'},
              {role:'Doctor',icon:'fa-user-md',color:'#7C3AED',bg:'linear-gradient(135deg,#7C3AED,#A78BFA)',features:['Manage patient schedule','Control live queue','Issue digital prescriptions','View patient history','Telehealth consultations'],desc:'Streamline your practice efficiently'},
              {role:'Admin',icon:'fa-crown',color:'#F59E0B',bg:'linear-gradient(135deg,#F59E0B,#FCD34D)',features:['Live analytics dashboard','Manage doctors & patients','Revenue tracking','System health monitoring','Queue management'],desc:'Complete control over your clinic'},
            ].map(r=>(
              <div key={r.role} style={{borderRadius:24,overflow:'hidden',boxShadow:'0 12px 40px rgba(0,0,0,.08)',transition:'all .2s',cursor:'pointer'}}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-8px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='none'}>
                <div style={{background:r.bg,padding:'32px 28px 28px',color:'white'}}>
                  <div style={{width:56,height:56,borderRadius:16,background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
                    <i className={'fas '+r.icon} style={{fontSize:24}}/>
                  </div>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:800,marginBottom:6}}>{r.role} Portal</div>
                  <div style={{fontSize:13,opacity:.85}}>{r.desc}</div>
                </div>
                <div style={{background:'white',padding:'24px 28px'}}>
                  {r.features.map(f=>(
                    <div key={f} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10,fontSize:13,color:'#475569'}}>
                      <i className='fas fa-check' style={{color:r.color,fontSize:11,flexShrink:0}}/>
                      {f}
                    </div>
                  ))}
                  <button onClick={()=>nav('/register')} style={{width:'100%',padding:'11px',background:r.bg,color:'white',border:'none',borderRadius:12,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer',marginTop:8}}>
                    Get Started as {r.role}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- TESTIMONIALS -- */}
      <section id='about' style={{padding:'96px 48px',background:'#0A1628'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <h2 style={{fontFamily:'Syne,sans-serif',fontSize:44,fontWeight:800,marginBottom:14,letterSpacing:-1,color:'white'}}>Trusted by 500+ Clinics</h2>
            <p style={{fontSize:17,color:'#94A3B8',lineHeight:1.7}}>From solo practitioners to multi-specialty hospitals across India</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
            {[
              {text:'We reduced average wait time from 48 to 14 minutes in the first month. Patients keep asking what changed.',name:'Dr. Rajesh Mehta',role:'Cardiologist  City Hospital, Mumbai',init:'RM',color:'#0D9B82'},
              {text:'The QR check-in eliminated our front desk bottleneck entirely. Staff now spend time on care, not paperwork.',name:'Dr. Sneha Patel',role:'Clinic Director  Apollo Clinic, Delhi',init:'SP',color:'#7C3AED'},
              {text:'Revenue analytics showed us Tuesday afternoons were 40% underbooked. Fixed it in a week - INR 80K more per month.',name:'Amit Kumar',role:'Administrator  Fortis, Bangalore',init:'AK',color:'#F59E0B'},
            ].map(t=>(
              <div key={t.name} style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:20,padding:28,transition:'all .2s'}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.09)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}>
                <div style={{color:"#F59E0B",marginBottom:16,fontSize:13,fontWeight:700}}>[ RATED 5/5 ]</div>
                <p style={{fontSize:15,lineHeight:1.7,color:'#CBD5E1',marginBottom:20,fontStyle:'italic'}}>"{t.text}"</p>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:44,height:44,borderRadius:'50%',background:t.color,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:15,color:'white',flexShrink:0}}>{t.init}</div>
                  <div><div style={{fontWeight:700,color:'white',fontSize:14}}>{t.name}</div><div style={{fontSize:12,color:'#64748B'}}>{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- PRICING -- */}
      <section id='pricing' style={{padding:'96px 48px',background:'#F8FAFC'}}>
        <div style={{maxWidth:1000,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <h2 style={{fontFamily:'Syne,sans-serif',fontSize:44,fontWeight:800,marginBottom:14,letterSpacing:-1,color:'#0A1628'}}>Simple, Transparent Pricing</h2>
            <p style={{fontSize:17,color:'#64748B',lineHeight:1.7}}>No hidden fees. Start free, scale as you grow.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24,alignItems:'center'}}>
            {[
              {name:'Starter',price:'Free',period:'Forever  1 doctor',features:['30 patients/day','Basic queue management','QR check-in','Email notifications'],featured:false,color:'#475569'},
              {name:'Pro',price:'INR 4,999',period:'/month per clinic',features:['Unlimited patients','AI wait prediction','Full analytics','HD Telehealth','E-prescriptions','Priority support'],featured:true,color:'white'},
              {name:'Enterprise',price:'Custom',period:'Multi-clinic networks',features:['Everything in Pro','ABDM integration','Custom integrations','Dedicated support','SLA guarantee'],featured:false,color:'#475569'},
            ].map(p=>(
              <div key={p.name} style={{
                background:p.featured?'#0A1628':'white',
                border:p.featured?'none':'1px solid #E2E8F0',
                borderRadius:24,padding:32,
                transform:p.featured?'scale(1.05)':'none',
                boxShadow:p.featured?'0 24px 64px rgba(0,0,0,.15)':'none',
                transition:'all .2s'
              }}
                onMouseEnter={e=>{if(!p.featured)e.currentTarget.style.transform='translateY(-4px)'}}
                onMouseLeave={e=>{if(!p.featured)e.currentTarget.style.transform='none'}}>
                {p.featured && <div style={{display:'inline-block',background:'#F59E0B',color:'white',fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:99,marginBottom:16,letterSpacing:.5}}>MOST POPULAR</div>}
                <div style={{fontSize:14,fontWeight:700,color:p.featured?'#94A3B8':'#94A3B8',textTransform:'uppercase',letterSpacing:.8,marginBottom:10}}>{p.name}</div>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:44,fontWeight:800,color:p.featured?'white':'#0A1628',lineHeight:1,marginBottom:4}}>{p.price}</div>
                <div style={{fontSize:13,color:p.featured?'#64748B':'#94A3B8',marginBottom:24}}>{p.period}</div>
                {p.features.map(f=>(
                  <div key={f} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10,fontSize:13,color:p.featured?'#CBD5E1':'#475569'}}>
                    <i className='fas fa-check' style={{color:'#0D9B82',fontSize:11,flexShrink:0}}/>
                    {f}
                  </div>
                ))}
                <button onClick={()=>nav('/register')} style={{width:'100%',padding:'12px',background:p.featured?tg:'#0A1628',color:'white',border:'none',borderRadius:12,fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:700,cursor:'pointer',marginTop:20}}>
                  {p.featured?'Start Free Trial':'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- CTA -- */}
      <section style={{padding:'96px 48px',background:tg,textAlign:'center'}}>
        <div style={{maxWidth:700,margin:'0 auto'}}>
          <h2 style={{fontFamily:'Syne,sans-serif',fontSize:48,fontWeight:800,color:'white',marginBottom:16,letterSpacing:-1}}>Ready to Transform Your Clinic?</h2>
          <p style={{fontSize:18,color:'rgba(255,255,255,.85)',marginBottom:36,lineHeight:1.7}}>Join 500+ clinics across India delivering better care with MEDIQUEUE.</p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <button onClick={()=>nav('/register')} style={{display:'inline-flex',alignItems:'center',gap:9,padding:'14px 32px',background:'white',color:'#0D9B82',border:'none',borderRadius:14,fontFamily:'DM Sans,sans-serif',fontWeight:700,fontSize:16,cursor:'pointer',boxShadow:'0 8px 24px rgba(0,0,0,.15)',transition:'all .2s'}}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='none'}>
              <i className='fas fa-rocket'/> Start Free Trial
            </button>
            <button onClick={()=>nav('/login')} style={{display:'inline-flex',alignItems:'center',gap:9,padding:'14px 32px',background:'rgba(255,255,255,.15)',color:'white',border:'2px solid rgba(255,255,255,.4)',borderRadius:14,fontFamily:'DM Sans,sans-serif',fontWeight:600,fontSize:16,cursor:'pointer',transition:'all .2s'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.25)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.15)'}>
              <i className='fas fa-sign-in-alt'/> Sign In
            </button>
          </div>
        </div>
      </section>

      {/* -- FOOTER -- */}
      <footer style={{background:'#030B17',padding:'60px 48px 32px'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:48,marginBottom:48}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
                <div style={{width:36,height:36,background:tg,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <i className='fas fa-heart-pulse' style={{color:'white',fontSize:16}}/>
                </div>
                <div>
                  <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:16,color:'white'}}>MEDIQUEUE</div>
                  <div style={{fontSize:9,color:'#475569',letterSpacing:.8,textTransform:'uppercase'}}>Digital Queue System</div>
                </div>
              </div>
              <p style={{fontSize:14,color:'#475569',lineHeight:1.7,maxWidth:260}}>Next-generation AI-powered appointment and queue management system for Indian healthcare.</p>
            </div>
            {[
              ['Product',['Features','Pricing','Integrations','Changelog','API Docs']],
              ['Company',['About Us','Blog','Careers','Press','Contact']],
              ['Legal',['Privacy Policy','Terms of Service','HIPAA Compliance','Cookie Policy']],
            ].map(([h,ls])=>(
              <div key={h}>
                <h5 style={{fontSize:12,fontWeight:700,letterSpacing:1,textTransform:'uppercase',color:'#64748B',marginBottom:16}}>{h}</h5>
                <ul style={{listStyle:'none',padding:0}}>
                  {ls.map(l=><li key={l} style={{marginBottom:10}}><a href='#' style={{fontSize:14,color:'#475569',textDecoration:'none',transition:'color .2s'}} onMouseEnter={e=>e.target.style.color='#0D9B82'} onMouseLeave={e=>e.target.style.color='#475569'}>{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div style={{borderTop:'1px solid #1E293B',paddingTop:28,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:13,color:'#334155'}}>
            <span> 2025 MEDIQUEUE  Mediqueue: Digital Appointment and Queue System. All rights reserved.</span>
            <span>Made with ?? for better Indian healthcare</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-12px)}
        }
        @keyframes pulse {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:.7;transform:scale(1.2)}
        }
        * { box-sizing: border-box; } html { scroll-padding-top: 80px; scroll-behavior: smooth; }
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-thumb{background:#0D9B82;border-radius:99px}
      `}</style>
    </div>
  );
}
